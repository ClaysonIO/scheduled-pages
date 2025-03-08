import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: './app.html'
    }
  },
  server: {
    open: './app.html'
  },
  plugins: [
      react(),
  ]
})
