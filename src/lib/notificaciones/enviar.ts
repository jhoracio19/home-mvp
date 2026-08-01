import webpush, { WebPushError } from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

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

// Le manda un push a TODOS los dispositivos suscritos de un usuario
// (puede tener varios: celular, laptop, etc). Usa la service role para
// leer sus suscripciones sin depender de la sesión de quien dispara la
// notificación (puede ser otro usuario, o el cron).
export async function enviarNotificacionAUsuario(usuarioId: string, notificacion: Notificacion): Promise<number> {
  asegurarVapid();
  const supabase = createAdminClient();

  const { data: suscripciones } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('usuario_id', usuarioId);

  if (!suscripciones || suscripciones.length === 0) return 0;

  const payload = JSON.stringify({ ...notificacion, url: notificacion.url ?? '/dashboard' });
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
