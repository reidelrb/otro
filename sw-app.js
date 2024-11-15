const CACHE_NAME = 'cache-v2';
const NO_CACHE_HOSTS = [
  'jsonblob.com',
  'devapiservice.com',
  'cors-anywhere.herokuapp.com',
  'telegra.ph',
  'api.telegra.ph',
  'api.telegram.org',
  'oauth.telegram.org',
  'cse.google.com',
  'api.counterapi.dev',
  'api.github.com',
  'encrypted-tbn0.gstatic.com'
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll( ['404.html', 'exit.js', 'get.js', 'account.js', 'token.js', 'offline.js', 'edit.js'] );
    })
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Manejar las solicitudes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    // Solicitudes del mismo origen
    event.respondWith(handleSameOriginRequest(event.request));
  } else {
    // Solicitudes de otros orígenes
    event.respondWith(handleCrossOriginRequest(event.request, url));
  }
});

// Función para manejar solicitudes del mismo origen
async function handleSameOriginRequest(request) {
  try {
    // Primero intenta obtener la respuesta de la red
    const networkResponse = await fetch(request);

    if (!networkResponse.ok) throw new Error('Network response was not ok');

    // Si la respuesta es válida, almacénala en caché
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());

    return networkResponse;
  } catch (error) {
    // Si falla, busca en la caché
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Devuelve la respuesta en caché si existe
      return cachedResponse;
    } else {
      // Si no hay respuesta en caché y no es un archivo JavaScript, devuelve la página 404.html
      if (!request.url.endsWith('.js')) {
        return caches.match('404.html');
      } else {
        // Si es un archivo JavaScript, devuelve un fragmento de JS que muestra un alert
        return new Response("/*Empty*/", {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }
    }
  }
}

// Función para manejar solicitudes de otros orígenes
async function handleCrossOriginRequest(request, url) {
  if (NO_CACHE_HOSTS.includes(url.hostname)) {
    // Si está en la lista de omisiones, no se almacena en caché
    return fetch(request);
  } else {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse; // Devuelve la respuesta en caché
    } else {
      const networkResponse = await fetch(request);
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()); // Almacena en caché
      return networkResponse;
    }
  }
}