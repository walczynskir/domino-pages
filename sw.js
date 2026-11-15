const cachePrefix = 'domino-offline-';
const cacheName = cachePrefix + '1.6.0';
const scope = self.registration.scope;
const assetNames = [
  'app.js', 'apple-touch-icon.png', 'board-view.js', 'credits.html',
  'credits.js', 'engine.js', 'favicon.ico', 'favicon.svg',
  'game.js', 'games-chest-menu.css', 'games-chest-menu.js', 'garden.webp',
  'help.js', 'history.js', 'i18n.js', 'icon-192.png',
  'icon-512.png', 'icon-maskable.png', 'index.html', 'locales.js',
  'logo.svg', 'manifest.webmanifest', 'shared-game.css', 'shared-palettes.css',
  'shared-victory.css', 'shared-victory.js', 'style.css', 'themes.css',
  'version.json',
];
const assets = new Set(assetNames.map(name => new URL(name, scope).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll([...assets].map(url => new Request(url, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  url.hash = '';
  const key = url.href === scope ? new URL('index.html', scope).href : url.href;
  // Serve a consistent release, including versioned asset URLs and gallery queries.
  if (!assets.has(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(key) ?? fetch(event.request);
  })());
});
