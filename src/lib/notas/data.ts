import { cache } from 'react';
import { getCasaActivaOrRedirect, getSesion } from '@/lib/casas/data';

export const getNotaCasa = cache(async () => {
  const casa = await getCasaActivaOrRedirect();
  const { supabase } = await getSesion();

  const { data, error } = await supabase
    .from('notas_casa')
    .select('*')
    .eq('casa_id', casa.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
});
