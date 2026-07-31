'use server';

import { redirect } from 'next/navigation';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

function leerCamposFormulario(formData: FormData) {
  return {
    nombre: String(formData.get('nombre') ?? '').trim(),
    frecuenciaDiasRaw: String(formData.get('frecuencia_dias') ?? '').trim(),
    asignadoA: String(formData.get('asignado_a') ?? '').trim() || null,
  };
}

export async function crearTarea(formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase, user } = await getSesion();
  const { nombre, frecuenciaDiasRaw, asignadoA } = leerCamposFormulario(formData);

  const frecuenciaDias = Number(frecuenciaDiasRaw);
  if (!nombre || !frecuenciaDias || frecuenciaDias <= 0) {
    redirect(`/tareas/nueva?error=${encodeURIComponent('Completa el nombre y la frecuencia (en días).')}`);
  }

  const { error } = await supabase.from('tareas').insert({
    casa_id: casa.id,
    nombre,
    frecuencia_dias: frecuenciaDias,
    asignado_a: asignadoA,
    creado_por: user.id,
  });

  if (error) {
    redirect(`/tareas/nueva?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/tareas');
}

export async function actualizarTarea(tareaId: string, formData: FormData) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();
  const { nombre, frecuenciaDiasRaw, asignadoA } = leerCamposFormulario(formData);

  const frecuenciaDias = Number(frecuenciaDiasRaw);
  if (!nombre || !frecuenciaDias || frecuenciaDias <= 0) {
    redirect(
      `/tareas/${tareaId}/editar?error=${encodeURIComponent('Completa el nombre y la frecuencia (en días).')}`
    );
  }

  const { error } = await supabase
    .from('tareas')
    .update({ nombre, frecuencia_dias: frecuenciaDias, asignado_a: asignadoA })
    .eq('id', tareaId)
    .eq('casa_id', casa.id);

  if (error) {
    redirect(`/tareas/${tareaId}/editar?error=${encodeURIComponent(error.message)}`);
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
    .select('nombre, frecuencia_dias')
    .single();

  if (!data) redirect('/tareas');

  const dias = data.frecuencia_dias;
  const proxima = dias === 1 ? 'mañana' : `en ${dias} días`;
  redirect(
    `/tareas?completada=${encodeURIComponent(data.nombre)}&proxima=${encodeURIComponent(proxima)}&completadaId=${tareaId}`
  );
}
