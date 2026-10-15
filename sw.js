// Kill-switch service worker.
//
// A previous build shipped a third-party ad/push service worker
// (3nbf4.com) that registered itself in visitors' browsers. Service
// workers persist across sessions, so simply removing the file is not
// enough — already-affected browsers keep running the old worker.
//
// This replacement unregisters itself and clears all caches the moment
// it activates, cleaning up any browser that still has the old worker.
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete every cache this origin owns.
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))

      // Unregister this service worker so it never runs again.
      await self.registration.unregister()

      // Force all open tabs to reload without a controlling worker.
      const clients = await self.clients.matchAll({ type: "window" })
      clients.forEach((client) => client.navigate(client.url))
    })(),
  )
})
