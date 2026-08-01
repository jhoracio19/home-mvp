'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';
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
  const { supabase } = await getSesion();

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

  const diasRestantes = calcularDiasRestantes(calcularProximaFecha(data));
  const proxima =
    diasRestantes === 0 ? 'hoy' : diasRestantes === 1 ? 'mañana' : `en ${diasRestantes} días`;

  redirect(
    `/tareas?completada=${encodeURIComponent(data.nombre)}&proxima=${encodeURIComponent(proxima)}&completadaId=${tareaId}`
  );
}
