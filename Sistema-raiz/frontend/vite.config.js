import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: ['es2015', 'safari13'],
    rollupOptions: {
      input: {
        index:    resolve(__dirname, 'index.html'),
        gmb:      resolve(__dirname, 'gmb.html'),
        feedback: resolve(__dirname, 'feedback.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api':    'http://localhost:8001',
      '/health': 'http://localhost:8001',
    },
  },
})
