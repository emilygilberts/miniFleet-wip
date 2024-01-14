const cacheName = "v1-minifleet";

self.addEventListener("install", function (event) {
  console.log("SW: installed");
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        "./",
        "logo_water192.png",
        "logo_water512.png",
        "manifest.json",
      ]);
    })
  );
});
self.addEventListener("fetch", function (event) {
  console.log(`SW: intercepting fetch event for: ", ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("SW: activate event");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Deleting old cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
