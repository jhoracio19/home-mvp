import { cache } from 'react';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export const getItemsRefri = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('items_refri')
    .select('*')
    .eq('casa_id', casa.id)
    .order('fecha_entrada', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
});

// Catálogo de referencia (frutas/verduras -> días estimados), de solo
// lectura para cualquier usuario autenticado. Se usa para autocompletar
// el formulario de nuevo item.
export const getReferenciaCaducidad = cache(async () => {
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('referencia_caducidad')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
});

export async function getItemRefri(id: string) {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('items_refri')
    .select('*')
    .eq('id', id)
    .eq('casa_id', casa.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
