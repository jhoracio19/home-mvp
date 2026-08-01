import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enviarNotificacionAUsuario } from '@/lib/notificaciones/enviar';
import { calcularDiasRestantes } from '@/lib/urgencia';
import { calcularFechaVencimiento } from '@/lib/refri/urgencia';
import { calcularProximaFecha } from '@/lib/tareas/urgencia';

// Job diario (ver vercel.json) que revisa items del refri por vencer y
// tareas asignadas que ya tocan, y manda un push a cada usuario
// afectado. Es un resumen una vez al día (compatible con el límite de
// cron del plan Hobby de Vercel); el aviso "te asignaron una tarea" es
// aparte y va al instante (ver tareas/actions.ts).
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

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

  let enviados = 0;
  for (const [usuarioId, mensajes] of mensajesPorUsuario) {
    enviados += await enviarNotificacionAUsuario(usuarioId, {
      title: 'Gestión doméstica',
      body: mensajes.length === 1 ? mensajes[0] : `${mensajes.length} pendientes: ${mensajes.join(', ')}`,
      url: '/dashboard',
    });
  }

  return NextResponse.json({ enviados });
}
