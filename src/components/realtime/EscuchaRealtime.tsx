'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Componente invisible: se suscribe a los cambios de una tabla para la
// casa activa (Supabase Realtime, vía "postgres_changes") y cuando
// detecta un INSERT/UPDATE/DELETE de cualquier miembro —incluida otra
// pestaña/dispositivo propio— vuelve a pedir los datos frescos del
// Server Component actual con router.refresh(). No duplicamos la
// lógica de urgencia/orden/formato en el cliente: el servidor sigue
// siendo la única fuente de verdad, esto solo dispara que se vuelva a
// consultar. RLS (no el `filter` de abajo) es lo que de verdad impide
// que alguien reciba cambios de una casa a la que no pertenece.
export function EscuchaRealtime({ tabla, casaId }: { tabla: string; casaId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const canal = supabase
      .channel(`realtime:${tabla}:${casaId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabla, filter: `casa_id=eq.${casaId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [tabla, casaId, router]);

  return null;
}
