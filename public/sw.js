// Service worker mínimo, dedicado solo a Web Push (no cachea nada ni
// habilita modo offline — eso es un feature aparte, no implementado aún).

self.addEventListener('push', (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data ? event.data.text() : '' };
  }

  const titulo = datos.title || 'Gestión doméstica';
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
