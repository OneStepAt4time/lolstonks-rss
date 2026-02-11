import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/lolstonks-rss/',
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
        // Smart code splitting strategy for React 19 + Framer Motion compatibility
        manualChunks: (id) => {
          // Vendor chunks - split large libraries for better caching
          if (id.includes('node_modules')) {
            // React + Framer Motion bundle (must be together to fix loading order)
            if (id.includes('react') || id.includes('react-dom') ||
                id.includes('framer-motion') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Three.js and related (large, used sparingly for 3D)
            if (id.includes('@react-three') || id.includes('three')) {
              return 'three-vendor';
            }
            // React Router (can be lazy loaded)
            if (id.includes('react-router')) {
              return 'router';
            }
            // Other vendors
            return 'vendor';
          }
        },
        // Chunk file naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
