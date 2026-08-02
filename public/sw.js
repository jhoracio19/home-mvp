// Service worker: Web Push + caché mínima para modo offline.
// No cachea páginas autenticadas (sus datos serían de otro usuario en
// un dispositivo compartido, o quedarían obsoletos) — solo la página
// de respaldo /offline y los assets estáticos ya visitados.

const CACHE = 'gestion-domestica-v1';
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

  // Assets estáticos con hash en el nombre (JS/CSS de Next, íconos):
  // cache-first, ya que su contenido nunca cambia bajo la misma URL.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
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
    data: { url: datos.url || '/dashboard' },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
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
