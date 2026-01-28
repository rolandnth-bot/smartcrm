import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Vercel: / (default). GitHub Pages: VITE_BASE_PATH=/smartcrm/ a workflow-ban
  base: process.env.VITE_BASE_PATH || '/',
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
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
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

