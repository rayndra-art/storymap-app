// vite.config.js (KODE HARUS DIGANTI TOTAL)

import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Buat konfigurasi bergantung pada mode (development atau production)
export default defineConfig(({ mode }) => ({
  // FIX KRITIS: BASE PATH KONDISIONAL
  // Untuk Localhost (dev), gunakan root '/'. Untuk GitHub Pages (production), gunakan '/storymap-app/'
  base: mode === 'production' ? '/storymap-app/' : '/', 

  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/scripts',
      filename: 'sw.js',
      injectManifest: {
        swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
        injectionPoint: 'self.__WB_MANIFEST',
      },
      manifest: {
        name: 'StoryMap App',
        short_name: 'StoryMap',
        description: 'Aplikasi berbagi cerita dengan peta lokasi.',
        theme_color: '#87cefa',
        background_color: '#f0f0f0',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],

  build: {
    outDir: 'dist',
  },
}));