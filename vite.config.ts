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
  // Build optimization — manual chunks
  // ============================================
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — shared by everything, cached long-term
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }

          // Framer Motion — large animation lib, lazy pages only
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
            return 'vendor-motion';
          }

          // TanStack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }

          // Axios + cache
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }

          // HLS.js — only needed for landing page
          if (id.includes('node_modules/hls.js')) {
            return 'vendor-hls';
          }

          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }

          // All other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
      },
    },

    // Smaller chunks, better caching
    chunkSizeWarningLimit: 300,
  },
})
