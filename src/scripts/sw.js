// src/scripts/sw.js

// 1. IMPORT SCRIPTS: Menggunakan CDN untuk Workbox Modules (FIX VITE)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-core.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-expiration.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-precaching.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-routing.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-strategies.js');


// 2. PRE-CACHING (Oleh injectManifest)
// Ini adalah placeholder. Vite PWA akan menyuntikkan daftar file statis di sini.
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);


// 3. RUNTIME CACHING UNTUK DATA DINAMIS (Kriteria PWA Advanced)
const { registerRoute } = workbox.routing;
const { StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;

// Caching untuk data API Story
registerRoute(
    // Hanya cache URL yang dimulai dengan API cerita (https://story-api.dicoding.dev/v1/stories)
    ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories'),
    new StaleWhileRevalidate({
        cacheName: 'story-api-data',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50, // Maksimal 50 entri data cerita
                maxAgeSeconds: 60 * 60 * 24 * 7, // Dicache selama 7 hari
            }),
        ],
    }),
);

// Caching untuk aset/gambar dari API Story (jika ada)
registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: 'story-images-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // Gambar dicache 30 hari
            }),
        ],
    }),
);


// 4. LOGIKA PUSH NOTIFICATION
// Listener untuk menerima pesan push dari server
self.addEventListener('push', (event) => {
    console.log('Push received:', event);
  
    // Payload notifikasi dari server
    const notificationData = event.data.json();
    const { title, options } = notificationData;
  
    // Tampilkan notifikasi secara dinamis (Kriteria Push Notification Skilled)
    const showNotificationPromise = self.registration.showNotification(title, options);
    
    event.waitUntil(showNotificationPromise);
});

// Listener saat notifikasi diklik
self.addEventListener('notificationclick', (event) => {
    const clickedNotification = event.notification;
    clickedNotification.close(); // Tutup notifikasi
  
    // Logika Navigasi (Kriteria Push Notification Advanced)
    // Cek apakah notifikasi membawa data URL/ID cerita
    const storyId = clickedNotification.data && clickedNotification.data.storyId;

    let targetUrl = '/#/'; // Default: ke homepage

    if (storyId) {
        targetUrl = `/#/stories/${storyId}`; // Contoh: navigasi ke halaman detail
    }
  
    // Buka window baru/fokus ke tab yang sudah ada
    const chainPromise = clients.openWindow(targetUrl);
  
    event.waitUntil(chainPromise);
});