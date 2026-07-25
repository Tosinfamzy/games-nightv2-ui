import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    // Bundle visualizer - generates stats.html after build
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true, // Listen on all network interfaces for mobile testing
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      treeshake: {
        // Workaround for Rollup bug with ConditionalExpression.getLiteralValueAtPath
        propertyReadSideEffects: false,
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Don't manually chunk React - let Vite handle it for proper initialization order
          // Router and query (core SPA functionality)
          if (
            id.includes('@tanstack/react-router') ||
            id.includes('@tanstack/react-query')
          ) {
            // Skip devtools - they're dev-only and already lazy
            if (id.includes('devtools')) return undefined
            return 'router-query'
          }
          // Socket.io for real-time features - lazy loaded
          if (id.includes('socket.io-client')) {
            return 'socket-vendor'
          }
          // HTTP client - used across the app
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor'
          }
          // QR code generation - lazy loaded when needed
          if (id.includes('qrcode') || id.includes('react-qr-code')) {
            return 'qr-vendor'
          }
          // Toast notifications
          if (id.includes('react-hot-toast')) {
            return 'ui-vendor'
          }
          return undefined
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
})
