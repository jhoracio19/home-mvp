import { cache } from 'react';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export const getTareas = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('casa_id', casa.id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
});

export async function getTarea(id: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('id', id)
    .eq('casa_id', casa.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export const getHistorialTareas = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('historial_tareas')
    .select('id, nombre_tarea, nombre_usuario, completada_en, usuario_id, a_tiempo')
    .eq('casa_id', casa.id)
    .order('completada_en', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data;
});
