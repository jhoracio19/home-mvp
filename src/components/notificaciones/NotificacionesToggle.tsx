'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { guardarSuscripcion, eliminarSuscripcion } from '@/app/[locale]/(app)/notificaciones/actions';
import { itemClase, iconoClase } from '@/components/layout/menu-clases';

type Estado = 'verificando' | 'no-soportado' | 'inactivo' | 'activo' | 'denegado' | 'procesando';

// El VAPID public key viaja como base64url; PushManager.subscribe pide
// un Uint8Array, no un string.
function base64UrlAUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function NotificacionesToggle() {
  const [estado, setEstado] = useState<Estado>('verificando');
  const t = useTranslations('Nav');

  useEffect(() => {
    let cancelado = false;

    async function detectar() {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (!cancelado) setEstado('no-soportado');
        return;
      }
      if (Notification.permission === 'denied') {
        if (!cancelado) setEstado('denegado');
        return;
      }

      try {
        const registro = await navigator.serviceWorker.register('/sw.js');
        const sub = await registro.pushManager.getSubscription();
        if (!cancelado) setEstado(sub ? 'activo' : 'inactivo');
      } catch {
        if (!cancelado) setEstado('no-soportado');
      }
    }

    detectar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function activar() {
    setEstado('procesando');
    try {
      const registro = await navigator.serviceWorker.register('/sw.js');
      const permiso = await Notification.requestPermission();
      if (permiso !== 'granted') {
        setEstado('denegado');
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error('Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY');

      const sub = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlAUint8Array(publicKey) as BufferSource,
      });
      const json = sub.toJSON();

      await guardarSuscripcion({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! },
      });
      setEstado('activo');
    } catch {
      setEstado('inactivo');
    }
  }

  async function desactivar() {
    setEstado('procesando');
    try {
      const registro = await navigator.serviceWorker.ready;
      const sub = await registro.pushManager.getSubscription();
      if (sub) {
        await eliminarSuscripcion(sub.endpoint);
        await sub.unsubscribe();
      }
      setEstado('inactivo');
    } catch {
      setEstado('activo');
    }
  }

  if (estado === 'no-soportado') return null;

  const campana = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconoClase}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  if (estado === 'denegado') {
    return (
      <p className={`${itemClase} cursor-default text-cocoa/50`}>
        {campana}
        {t('notificacionesBloqueadas')}
      </p>
    );
  }

  const activo = estado === 'activo';
  const cargando = estado === 'verificando' || estado === 'procesando';

  return (
    <button
      type="button"
      onClick={activo ? desactivar : activar}
      disabled={cargando}
      className={`w-full text-left ${itemClase} disabled:opacity-50`}
    >
      {campana}
      {activo ? t('desactivarNotificaciones') : t('activarNotificaciones')}
    </button>
  );
}
