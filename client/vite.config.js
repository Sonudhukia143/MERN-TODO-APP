import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts:['client-e3ad.onrender.com']
  },
  define: {
    global: 'globalThis',
  }
})
