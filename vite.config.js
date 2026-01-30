import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// BUILD VERSION: Force new hashes on every build
const BUILD_ID = Date.now().toString(36);

export default defineConfig({
  // Vercel deployment: base path must be / (root)
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Simplified asset structure with build ID for cache busting
        manualChunks: undefined,
        chunkFileNames: `assets/[name]-[hash]-${BUILD_ID}.js`,
        entryFileNames: `assets/[name]-[hash]-${BUILD_ID}.js`,
        assetFileNames: `assets/[name]-[hash]-${BUILD_ID}.[ext]`
      }
    },
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

