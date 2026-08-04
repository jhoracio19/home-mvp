// Service worker: Web Push + caché mínima para modo offline.
// No cachea páginas autenticadas (sus datos serían de otro usuario en
// un dispositivo compartido, o quedarían obsoletos) — solo la página
// de respaldo /offline y los assets estáticos ya visitados.

const CACHE = 'gestion-domestica-v2';
const RUTAS_PRECACHE = ['/es/offline', '/en/offline', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(RUTAS_PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navegación (ir a una página): red primero, y si no hay conexión,
  // muestra la página de respaldo en vez del error feo del navegador.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        const locale = url.pathname.startsWith('/en') ? 'en' : 'es';
        return caches.match(`/${locale}/offline`);
      })
    );
    return;
  }

  // En local (npm run dev), los nombres de archivo de _next/static NO
  // llevan hash de contenido estable entre reinicios como en producción
  // — cachearlos cache-first hace que el service worker siga sirviendo
  // JS viejo después de cada cambio, aunque el servidor ya tenga el
  // código nuevo (así se coló el mismatch de hidratación con
  // MenuLanding). En dev, ese pedazo simplemente no entra al cache.
  const esDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

  // Assets estáticos con hash en el nombre (JS/CSS de Next, íconos):
  // cache-first, ya que su contenido nunca cambia bajo la misma URL.
  if (!esDev && (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/'))) {
    event.respondWith(
      caches.match(request).then(
        (cacheada) =>
          cacheada ||
          fetch(request).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copia));
            return respuesta;
          })
      )
    );
  }
});

self.addEventListener('push', (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data ? event.data.text() : '' };
  }

  const titulo = datos.title || 'RemindHome';
  const opciones = {
    body: datos.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: datos.url || '/dashboard', accion: datos.accion || null },
  };

  // Botones de acción (ej. "Marcar como pagado"): no los soporta
  // Safari/iOS, así que ahí simplemente no aparece el botón y la
  // notificación se comporta como cualquier otra (toca y abre la app)
  // — degrada bien sin código extra.
  if (datos.accion && datos.accion.tipo === 'confirmar_pago' && datos.accion.etiquetaBoton) {
    opciones.actions = [{ action: 'confirmar_pago', title: datos.accion.etiquetaBoton }];
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

// Confirma el pago sin abrir la app: hace el POST directo desde el
// service worker (comparte cookies de sesión del mismo origen) y
// muestra una segunda notificación local con el resultado. Si algo
// falla, no reintenta — le pide a la persona que abra la app.
function confirmarPagoDesdeAccion(accion) {
  return fetch('/api/gastos/marcar-pagado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ deUsuarioId: accion.deUsuarioId, monto: accion.monto, casaId: accion.casaId }),
  })
    .then((respuesta) =>
      self.registration.showNotification(respuesta.ok ? accion.tituloExito : accion.tituloError, {
        body: respuesta.ok ? accion.cuerpoExito : accion.cuerpoError,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: { url: '/gastos' },
      })
    )
    .catch(() =>
      self.registration.showNotification(accion.tituloError, {
        body: accion.cuerpoError,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: { url: '/gastos' },
      })
    );
}

self.addEventListener('notificationclick', (event) => {
  const accion = event.notification.data && event.notification.data.accion;

  if (event.action === 'confirmar_pago' && accion) {
    event.notification.close();
    event.waitUntil(confirmarPagoDesdeAccion(accion));
    return;
  }

  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if (ventana.url.includes(url) && 'focus' in ventana) return ventana.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
