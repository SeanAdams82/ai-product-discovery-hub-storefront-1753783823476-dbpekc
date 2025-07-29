const CACHE_NAME = 'ai-product-discovery-hub-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/privacy-policy.html',
    '/terms-of-service.html',
    '/cookie-policy.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});