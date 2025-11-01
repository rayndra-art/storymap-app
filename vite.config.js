// vite.config.js

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    // FIX KRITIS UNTUK GITHUB PAGES: BASE URL
    // Ini harus diisi dengan nama repository Anda
    base: '/storymap-app/', 

    plugins: [
      VitePWA({
        // Menggunakan strategi InjectManifest untuk Service Worker kustom
        strategies: 'injectManifest', 
        
        // Lokasi folder Service Worker sumber Anda
        srcDir: 'src/scripts', 
        
        // Nama file SW output yang akan diletakkan di dist/
        filename: 'sw.js', 
        
        injectManifest: {
          // Tentukan path absolut ke file SW sumber Anda
          swSrc: path.resolve(__dirname, 'src/scripts/sw.js'), 
          // Titik injeksi di dalam sw.js
          injectionPoint: 'self.__WB_MANIFEST', 
        },
        
        // Konfigurasi Web App Manifest (Kriteria PWA: Installable & Skilled)
        manifest: {
          name: 'StoryMap App',
          short_name: 'StoryMap',
          description: 'Aplikasi berbagi cerita dengan peta lokasi.',
          theme_color: '#87cefa', // lightskyblue
          background_color: '#f0f0f0', // Wajib ada untuk mode installable
          display: 'standalone', // Wajib ada untuk mode installable
          
          icons: [
            { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            // Tambahkan masking icon jika diperlukan
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          
          // Screenshots untuk Kriteria Skilled (+3 pts)
          screenshots: [
              {
                src: '/images/screenshot-desktop-1.png', // Pastikan gambar ini ada di folder public/images
                sizes: '1280x800', 
                type: 'image/png',
                form_factor: 'wide', // Untuk tampilan desktop/tablet
              },
              {
                src: '/images/screenshot-mobile-1.png', // Pastikan gambar ini ada di folder public/images
                sizes: '720x1280', 
                type: 'image/png',
                form_factor: 'narrow', // Untuk tampilan mobile
              }
          ],
        },
      }),
    ],

    // Pastikan output build ke folder 'dist'
    build: {
      outDir: 'dist',
    },
});