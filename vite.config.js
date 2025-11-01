import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // Base path HARUS sesuai nama repo kamu di GitHub Pages
  base: '/storymap-app/',

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
});
