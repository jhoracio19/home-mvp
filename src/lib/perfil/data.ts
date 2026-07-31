import { cache } from 'react';
import { getSesion } from '@/lib/casas/data';

export const getPerfilPropio = cache(async () => {
  const { supabase, user } = await getSesion();

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
});
