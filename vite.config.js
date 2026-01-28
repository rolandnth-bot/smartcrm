import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/smartcrm/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Production build optimalizációk
    minify: 'esbuild',
    sourcemap: false, // Source maps kikapcsolva production build-ben (kisebb bundle)
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Rollup opciók
    rollupOptions: {
      output: {
        // Manual chunk splitting - jobb cache kezelés
        manualChunks(id) {
          // Vendor chunk-ok
          if (id.includes('node_modules')) {
            // React és kapcsolódó könyvtárak
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            // Zustand
            if (id.includes('zustand')) {
              return 'zustand-vendor';
            }
            // Egyéb node_modules (kivéve a már kezelt könyvtárakat)
            if (!id.includes('react') && !id.includes('firebase') && !id.includes('zustand')) {
              return 'vendor';
            }
          }
        },
        // Chunk fájlnevek hash-szel
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand']
  },
  // Vitest
  test: {
    globals: true,
    environment: 'node'
  }
})

