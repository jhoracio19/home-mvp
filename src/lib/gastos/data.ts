import { cache } from 'react';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export const getGastos = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .eq('casa_id', casa.id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
});
