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
