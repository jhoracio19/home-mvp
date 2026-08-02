import { cache } from 'react';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export const getListaCompras = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('lista_compras')
    .select('*')
    .eq('casa_id', casa.id)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
});
