// オフラインで使えるようにするための Service Worker。版を上げると古いキャッシュを消して入れ替える。
const VERSION = 'v1-202611150540';
const FILES = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './packs.json', './vocab-core.json', './idioms.json', './grammar.json', './reading.json', './listening.json', './icon-192.png', './icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok && new URL(e.request.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copy));
          }
          return res;
        }),
    ),
  );
});
