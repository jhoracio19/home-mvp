'use server';

import { getSesion } from '@/lib/casas/data';

type SuscripcionPush = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function guardarSuscripcion(sub: SuscripcionPush) {
  const { supabase, user } = await getSesion();

  const { error } = await supabase.from('push_subscriptions').upsert(
    { usuario_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: 'endpoint' }
  );

  if (error) throw new Error(error.message);
}

export async function eliminarSuscripcion(endpoint: string) {
  const { supabase } = await getSesion();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}
