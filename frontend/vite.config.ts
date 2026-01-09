import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/lolstonksrss/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/rss': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/feed.xml': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Enable sourcemaps for production debugging
    sourcemap: true,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize manual chunks for better caching
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'react-router';
          }
          // Three.js
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
            return 'three-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/zustand/')) {
            return 'ui-library';
          }
          // Other node modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Optimize assets
    assetsInlineLimit: 4096,
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand'],
  },
})
