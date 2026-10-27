/* Network only — no caching, so phones always get the latest version. Needed so Android installs the pages as apps. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
