import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // ✅ Base path WAJIB sesuai nama repo GitHub Pages kamu
  base: '/storymap-app/',

  plugins: [
    VitePWA({
      // ✅ Gunakan InjectManifest karena kamu punya sw.js kustom
      strategies: 'injectManifest',
      srcDir: 'src/scripts',
      filename: 'sw.js',
      injectManifest: {
        // ✅ Pastikan path absolut ke service worker benar
        swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
        injectionPoint: 'self.__WB_MANIFEST',
      },

      // ✅ Manifest PWA (biar installable di perangkat)
      manifest: {
        name: 'StoryMap App',
        short_name: 'StoryMap',
        description: 'Aplikasi berbagi cerita dengan peta lokasi.',
        theme_color: '#87cefa',
        background_color: '#f0f0f0',
        display: 'standalone',
        start_url: '/storymap-app/', // ⚠️ penting agar PWA bisa load di halaman utama
        scope: '/storymap-app/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],

  // ✅ Output build ke folder dist (ini sudah benar)
  build: {
    outDir: 'dist',
  },
});
