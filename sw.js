const CACHE_NAME = "ruffle-v1";
const APP_SHELL_FILES = [
    "./",
    "./main.js",
    "./elements.js",
    "./icons/favicon-32.png",
    "./icons/favicon-64.png",
    "./icons/favicon-180.png"
];
const CONTENT_TO_CACHE = APP_SHELL_FILES;

self.addEventListener("install", (e) => {
    e.waitUntil((async () => {
        let cache = await caches.open(CACHE_NAME);
        await cache.addAll(CONTENT_TO_CACHE);
    })());
});

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        let r = await caches.match(e.request);
        if (r) return r;

        let response = await fetch(e.request);
        let cache = await caches.open(CACHE_NAME);
        cache.put(e.request, response.clone());
        return response;
    })());
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key === CACHE_NAME) { return; }
            return caches.delete(key);
        }))
    }));
});
