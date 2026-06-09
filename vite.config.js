import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/english-quizzer/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    // Tránh lỗi chunk size warning
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Code splitting để load nhanh hơn
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase':     ['@supabase/supabase-js'],
        },
      },
    },
  },
})
