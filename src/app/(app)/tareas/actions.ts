'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getMiembrosCasaActiva, getSesion } from '@/lib/casas/data';
import { nombreMiembro } from '@/lib/casas/nombre-miembro';
import { getPerfilPropio } from '@/lib/perfil/data';
import { calcularDiasRestantes, calcularProximaFecha } from '@/lib/tareas/urgencia';
import { enviarNotificacionAUsuario } from '@/lib/notificaciones/enviar';
import type { TipoFrecuencia } from '@/lib/types/database';

// Si falla el push no debe tumbar la creación/edición de la tarea —
// por eso el try/catch, aquí termina el error.
async function notificarAsignacion(usuarioId: string, nombreTarea: string) {
  try {
    await enviarNotificacionAUsuario(usuarioId, {
      title: 'Nueva tarea asignada',
      body: `Te asignaron: ${nombreTarea}`,
      url: '/tareas',
    });
  } catch {
    // Silencioso a propósito.
  }
}

const MAX_NOMBRE = 100;

// El <select> del formulario solo lista miembros de la casa, pero eso
// no evita que alguien mande un usuario_id distinto a mano (form
// tamperado). Sin esta validación, cualquiera podría "asignar" una
// tarea a cualquier usuario_id de la plataforma — y como asignar
// dispara un push (notificarAsignacion), eso sería un vector para
// mandarle notificaciones arbitrarias a cualquier persona, no solo a
// tus compañeros de casa.
async function asignadoEsMiembro(asignadoA: string | null): Promise<boolean> {
  if (!asignadoA) return true;
  const miembros = await getMiembrosCasaActiva();
  return miembros.some((m) => m.usuario_id === asignadoA);
}

function leerCamposFormulario(formData: FormData) {
  const tipoFrecuenciaRaw = String(formData.get('tipo_frecuencia') ?? '').trim();
  const tipoFrecuencia: TipoFrecuencia = tipoFrecuenciaRaw === 'dias_semana' ? 'dias_semana' : 'intervalo';

  return {
    nombre: String(formData.get('nombre') ?? '').trim(),
    tipoFrecuencia,
    frecuenciaDiasRaw: String(formData.get('frecuencia_dias') ?? '').trim(),
    diasSemana: formData
      .getAll('dias_semana')
      .map((v) => Number(v))
      .filter((v) => Number.isInteger(v) && v >= 0 && v <= 6),
    asignadoA: String(formData.get('asignado_a') ?? '').trim() || null,
  };
}

type ValoresFrecuencia = {
  tipo_frecuencia: TipoFrecuencia;
  frecuencia_dias: number | null;
  dias_semana: number[] | null;
};

// Valida y arma el objeto a guardar según el modo. Devuelve un mensaje
// de error si algo no cuadra, o los campos listos para insert/update.
function validarFrecuencia(
  campos: ReturnType<typeof leerCamposFormulario>
): { error: string } | { valores: ValoresFrecuencia } {
  if (campos.tipoFrecuencia === 'dias_semana') {
    if (campos.diasSemana.length === 0) {
      return { error: 'Elige al menos un día de la semana.' };
    }
    return {
      valores: {
        tipo_frecuencia: 'dias_semana',
        frecuencia_dias: null,
        dias_semana: campos.diasSemana,
      },
    };
  }

  const frecuenciaDias = Number(campos.frecuenciaDiasRaw);
  if (!frecuenciaDias || frecuenciaDias <= 0) {
    return { error: 'Indica cada cuántos días se repite.' };
  }
  return {
    valores: {
      tipo_frecuencia: 'intervalo',
      frecuencia_dias: frecuenciaDias,
      dias_semana: null,
    },
  };
}

export async function crearTarea(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();
  const campos = leerCamposFormulario(formData);

  if (!campos.nombre) {
    redirect(`/tareas/nueva?error=${encodeURIComponent('Ponle un nombre a la tarea.')}`);
  }
  if (campos.nombre.length > MAX_NOMBRE) {
    redirect(`/tareas/nueva?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`);
  }
  if (!(await asignadoEsMiembro(campos.asignadoA))) {
    redirect(`/tareas/nueva?error=${encodeURIComponent('Solo puedes asignar la tarea a alguien de esta casa.')}`);
  }

  const resultado = validarFrecuencia(campos);
  if ('error' in resultado) {
    redirect(`/tareas/nueva?error=${encodeURIComponent(resultado.error)}`);
  }

  const { error } = await supabase.from('tareas').insert({
    casa_id: casa.id,
    nombre: campos.nombre,
    asignado_a: campos.asignadoA,
    creado_por: user.id,
    ...resultado.valores,
  });

  if (error) {
    redirect(`/tareas/nueva?error=${encodeURIComponent(error.message)}`);
  }

  if (campos.asignadoA && campos.asignadoA !== user.id) {
    await notificarAsignacion(campos.asignadoA, campos.nombre);
  }

  redirect('/tareas');
}

export async function actualizarTarea(tareaId: string, formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();
  const campos = leerCamposFormulario(formData);

  if (!campos.nombre) {
    redirect(`/tareas/${tareaId}/editar?error=${encodeURIComponent('Ponle un nombre a la tarea.')}`);
  }
  if (campos.nombre.length > MAX_NOMBRE) {
    redirect(
      `/tareas/${tareaId}/editar?error=${encodeURIComponent(`El nombre no puede pasar de ${MAX_NOMBRE} caracteres.`)}`
    );
  }
  if (!(await asignadoEsMiembro(campos.asignadoA))) {
    redirect(
      `/tareas/${tareaId}/editar?error=${encodeURIComponent('Solo puedes asignar la tarea a alguien de esta casa.')}`
    );
  }

  const resultado = validarFrecuencia(campos);
  if ('error' in resultado) {
    redirect(`/tareas/${tareaId}/editar?error=${encodeURIComponent(resultado.error)}`);
  }

  const { data: anterior } = await supabase
    .from('tareas')
    .select('asignado_a')
    .eq('id', tareaId)
    .eq('casa_id', casa.id)
    .maybeSingle();

  const { error } = await supabase
    .from('tareas')
    .update({
      nombre: campos.nombre,
      asignado_a: campos.asignadoA,
      ...resultado.valores,
    })
    .eq('id', tareaId)
    .eq('casa_id', casa.id);

  if (error) {
    redirect(`/tareas/${tareaId}/editar?error=${encodeURIComponent(error.message)}`);
  }

  const cambioDeAsignado = campos.asignadoA && campos.asignadoA !== anterior?.asignado_a;
  if (cambioDeAsignado && campos.asignadoA !== user.id) {
    await notificarAsignacion(campos.asignadoA!, campos.nombre);
  }

  redirect('/tareas');
}

// Se usan con .bind(null, tarea.id) desde un <form> por cada tarea listada.
export async function eliminarTarea(tareaId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  await supabase.from('tareas').delete().eq('id', tareaId).eq('casa_id', casa.id);

  redirect('/tareas');
}

export async function completarTarea(tareaId: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();

  // Hay que leer el estado ANTES de actualizar: "a tiempo" se define
  // contra la fecha de vencimiento que tenía la tarea justo antes de
  // marcarse hecha. Una vez que se actualiza ultima_ejecucion, esa
  // fecha ya avanzó a la siguiente y no se puede recuperar.
  const { data: antes } = await supabase
    .from('tareas')
    .select('nombre, tipo_frecuencia, frecuencia_dias, dias_semana, ultima_ejecucion, created_at')
    .eq('id', tareaId)
    .eq('casa_id', casa.id)
    .maybeSingle();

  if (!antes) redirect('/tareas');

  const aTiempo = calcularDiasRestantes(calcularProximaFecha(antes)) >= 0;

  const hoy = new Date();
  const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate()
  ).padStart(2, '0')}`;

  const { data } = await supabase
    .from('tareas')
    .update({ ultima_ejecucion: hoyISO })
    .eq('id', tareaId)
    .eq('casa_id', casa.id)
    .select('nombre, tipo_frecuencia, frecuencia_dias, dias_semana, ultima_ejecucion, created_at')
    .single();

  if (!data) redirect('/tareas');

  // Snapshot del nombre de la tarea y de quién la hizo — el historial no
  // debe cambiar si después renombran la tarea, la borran, o esa persona
  // sale de la casa.
  const perfil = await getPerfilPropio();
  await supabase.from('historial_tareas').insert({
    casa_id: casa.id,
    tarea_id: tareaId,
    nombre_tarea: data.nombre,
    usuario_id: user.id,
    nombre_usuario: nombreMiembro({ email: user.email ?? '', nombre: perfil?.nombre ?? null, apellido: perfil?.apellido ?? null }),
    a_tiempo: aTiempo,
  });

  const diasRestantes = calcularDiasRestantes(calcularProximaFecha(data));
  const proxima =
    diasRestantes === 0 ? 'hoy' : diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`;

  redirect(
    `/tareas?completada=${encodeURIComponent(data.nombre)}&proxima=${encodeURIComponent(proxima)}&completadaId=${tareaId}`
  );
}
