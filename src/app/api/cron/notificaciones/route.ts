import { NextRequest, NextResponse } from 'next/server';
import webpush, { WebPushError } from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';
import { calcularDiasRestantes } from '@/lib/urgencia';
import { calcularFechaVencimiento } from '@/lib/refri/urgencia';
import { calcularProximaFecha } from '@/lib/tareas/urgencia';

// Job diario (ver vercel.json) que revisa items del refri por vencer y
// tareas asignadas que ya tocan, y manda un push a cada usuario
// afectado. No usa Realtime ni WebSockets: es un resumen una vez al día,
// suficiente para el MVP y compatible con el límite de cron del plan
// Hobby de Vercel (una corrida diaria).
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const supabase = createAdminClient();

  const [{ data: items }, { data: tareas }, { data: miembros }] = await Promise.all([
    supabase
      .from('items_refri')
      .select('casa_id, nombre, tipo_tracking, fecha_entrada, fecha_caducidad, dias_estimados'),
    supabase
      .from('tareas')
      .select('casa_id, nombre, asignado_a, tipo_frecuencia, frecuencia_dias, dias_semana, ultima_ejecucion, created_at'),
    supabase.from('miembros_casa').select('usuario_id, casa_id'),
  ]);

  const miembrosPorCasa = new Map<string, string[]>();
  for (const m of miembros ?? []) {
    miembrosPorCasa.set(m.casa_id, [...(miembrosPorCasa.get(m.casa_id) ?? []), m.usuario_id]);
  }

  const mensajesPorUsuario = new Map<string, string[]>();
  function agregarMensaje(usuarioId: string, texto: string) {
    mensajesPorUsuario.set(usuarioId, [...(mensajesPorUsuario.get(usuarioId) ?? []), texto]);
  }

  // Items del refri: se avisa a TODOS los miembros de la casa (no están
  // asignados a nadie en particular).
  for (const item of items ?? []) {
    const dias = calcularDiasRestantes(calcularFechaVencimiento(item));
    if (dias !== 0 && dias !== 1) continue;
    const texto = dias === 0 ? `${item.nombre} vence hoy` : `${item.nombre} vence mañana`;
    for (const usuarioId of miembrosPorCasa.get(item.casa_id) ?? []) {
      agregarMensaje(usuarioId, texto);
    }
  }

  // Tareas: solo a quien está asignada. dias <= 0 incluye "hoy" y
  // vencidas (recordatorio diario mientras siga sin marcarse hecha).
  for (const tarea of tareas ?? []) {
    if (!tarea.asignado_a) continue;
    const dias = calcularDiasRestantes(calcularProximaFecha(tarea));
    if (dias <= 0) agregarMensaje(tarea.asignado_a, `Te toca: ${tarea.nombre}`);
  }

  if (mensajesPorUsuario.size === 0) {
    return NextResponse.json({ enviados: 0 });
  }

  const { data: suscripciones } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('usuario_id', [...mensajesPorUsuario.keys()]);

  let enviados = 0;
  const endpointsExpirados: string[] = [];

  await Promise.all(
    (suscripciones ?? []).map(async (sub) => {
      const mensajes = mensajesPorUsuario.get(sub.usuario_id);
      if (!mensajes) return;

      const payload = JSON.stringify({
        title: 'Gestión doméstica',
        body: mensajes.length === 1 ? mensajes[0] : `${mensajes.length} pendientes: ${mensajes.join(', ')}`,
        url: '/dashboard',
      });

      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        enviados++;
      } catch (err) {
        // 404/410: la suscripción ya no existe del lado del navegador
        // (desinstaló la app, borró datos, etc.) — se limpia de una vez.
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
          endpointsExpirados.push(sub.endpoint);
        }
      }
    })
  );

  if (endpointsExpirados.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', endpointsExpirados);
  }

  return NextResponse.json({ enviados });
}
