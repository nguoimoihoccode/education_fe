import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    globals: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Precache static assets khi build
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Runtime caching - CHỈ fonts + images
        // API caching do axios-cache-interceptor + TanStack Query xử lý
        runtimeCaching: [
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Images
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          // Video/HLS - network only
          {
            urlPattern: /\.(?:mp4|m3u8|ts)$/,
            handler: 'NetworkOnly',
          },
        ],

        // Không intercept API requests - để axios + TanStack Query handle
        navigateFallbackDenylist: [/^\/api/],
      },

      // PWA Manifest
      manifest: {
        name: 'EduPro - Learning Platform',
        short_name: 'EduPro',
        description: 'Nền tảng học tập thông minh với AI',
        theme_color: '#020405',
        background_color: '#020405',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/icons/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

// ============================================
  // Build optimization — safe vendor splitting
  // ============================================
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React core + its full interop closure. Keeping every module React
          // (and react-dom) depends on in the SAME chunk is what prevents the
          // circular-chunk race that crashed `React.memo` on reload. Do NOT
          // move scheduler / use-sync-external-store / react-router away.
          if (id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('/scheduler/') ||
              id.includes('/use-sync-external-store/') ||
              id.includes('/react-hot-toast/') ||
              id.includes('/goober/')) {
            return 'vendor-react';
          }

          // Charts/visualization — imported only by lazy page components.
          if (id.includes('/recharts/') ||
              id.includes('/d3') ||
              id.includes('/@nivo/') ||
              id.includes('/react-redux/')) {
            return 'vendor-charts';
          }

          // Motion/animation.
          if (id.includes('/framer-motion/') ||
              id.includes('/motion/') ||
              id.includes('/animejs/')) {
            return 'vendor-animation';
          }

          // TanStack (react-query etc.) — depends on react core only.
          if (id.includes('/@tanstack/')) {
            return 'vendor-query';
          }

          // Network layer.
          if (id.includes('/axios')) {
            return 'vendor-network';
          }

          // Icons — leaf, imports react core only.
          if (id.includes('/lucide-react/')) {
            return 'vendor-icons';
          }
        },
      },
    },

    // Keep warnings strict while allowing the lazy HLS decoder chunk.
    chunkSizeWarningLimit: 350,
  },
})
