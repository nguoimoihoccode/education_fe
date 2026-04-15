import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      workbox: {
        // Precache tất cả assets khi build
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        
        // Runtime caching strategies
        runtimeCaching: [
          // Google Fonts - Cache First (fonts ít thay đổi)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 năm
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // API GET requests - StaleWhileRevalidate (cache + background update)
          {
            urlPattern: ({ url }) => {
              const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
              return url.origin === new URL(apiUrl).origin && url.pathname.match(/^\/(courses|languages|education|flashcard|quiz|leaderboard|community)/);
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 phút
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              matchOptions: {
                ignoreSearch: false,
              },
            },
          },
          // Images - Cache First
          {
            urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 ngày
              },
            },
          },
          // Video/HLS streams - Network Only (quá lớn để cache)
          {
            urlPattern: /\.(?:mp4|m3u8|ts)$/,
            handler: 'NetworkOnly',
          },
        ],
      },
      
      // PWA Manifest
      manifest: {
        name: 'EduPro - Learning Platform',
        short_name: 'EduPro',
        description: 'Nền tảng học tập thông minh với AI - Khóa học, Flashcards, Quiz & AI Tutor',
        theme_color: '#020405',
        background_color: '#020405',
        display: 'standalone',
        orientation: 'portrait-primary',
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
})
