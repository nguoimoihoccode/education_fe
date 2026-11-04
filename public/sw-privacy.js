// Upgrade cleanup for older versions that cached private images by extension.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete('images-cache'));
});
