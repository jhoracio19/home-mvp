import webpush, { WebPushError } from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Locale } from '@/i18n/routing';

let vapidConfigurado = false;
function asegurarVapid() {
  if (vapidConfigurado) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidConfigurado = true;
}

type Notificacion = { title: string; body: string; url?: string };
type ConstructorNotificacion = (locale: Locale) => Notificacion | Promise<Notificacion>;

// Le manda un push a TODOS los dispositivos suscritos de un usuario
// (puede tener varios: celular, laptop, etc). Usa la service role para
// leer sus suscripciones sin depender de la sesión de quien dispara la
// notificación (puede ser otro usuario, o el cron).
//
// `notificacion` acepta un objeto fijo o un constructor (locale) =>
// Notificacion: esto último es lo normal, porque el idioma correcto
// es el del DESTINATARIO (perfiles.idioma), no el de quien dispara la
// acción — un push no tiene cookie/request de por medio para saber
// "en qué idioma está viendo esto la persona que dispara la acción",
// así que hay que ir a buscar el del destinatario explícitamente.
export async function enviarNotificacionAUsuario(
  usuarioId: string,
  notificacion: Notificacion | ConstructorNotificacion
): Promise<number> {
  asegurarVapid();
  const supabase = createAdminClient();

  const { data: suscripciones } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('usuario_id', usuarioId);

  if (!suscripciones || suscripciones.length === 0) return 0;

  let contenido: Notificacion;
  if (typeof notificacion === 'function') {
    const { data: perfil } = await supabase.from('perfiles').select('idioma').eq('id', usuarioId).maybeSingle();
    contenido = await notificacion((perfil?.idioma as Locale) ?? 'es');
  } else {
    contenido = notificacion;
  }

  const payload = JSON.stringify({ ...contenido, url: contenido.url ?? '/dashboard' });
  const endpointsExpirados: string[] = [];
  let enviados = 0;

  await Promise.all(
    suscripciones.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        enviados++;
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
          endpointsExpirados.push(sub.endpoint);
        }
      }
    })
  );

  if (endpointsExpirados.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', endpointsExpirados);
  }

  return enviados;
}
