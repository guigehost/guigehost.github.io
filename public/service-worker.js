self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    for (const client of clients) {
      client.navigate(client.url);
    }
  });
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
