// ============================================
// HAIRIAMRI.BUZZ — Service Worker
// ============================================

const CACHE_NAME = 'hairiamri-v1';
const RUNTIME_CACHE = 'hairiamri-runtime-v1';

// Fail yang wajib ada (offline support)
const PRECACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/daftar.html',
    '/login.html',
    '/verify.html',
    '/assets/logoUtama/logoUtama.png'
];

// ========== INSTALL ==========
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE).catch(err => console.log('Cache err:', err)))
            .then(() => self.skipWaiting())
    );
});

// ========== ACTIVATE ==========
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// ========== FETCH ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip external requests (Apps Script, Resend, dll)
    if (url.origin !== location.origin) return;

    // HTML — Network first, fallback cache
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
        );
        return;
    }

    // CSS, JS, Images — Cache first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const copy = response.clone();
                caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
                return response;
            });
        })
    );
});

// ========== MESSAGE (untuk skipWaiting) ==========
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
