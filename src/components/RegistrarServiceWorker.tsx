'use client';

import { useEffect } from 'react';

// Se registra siempre (no solo al activar notificaciones) para que la
// caché de modo offline (public/sw.js) quede lista desde la primera
// visita, sin depender de que el usuario active los avisos push.
export function RegistrarServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}
