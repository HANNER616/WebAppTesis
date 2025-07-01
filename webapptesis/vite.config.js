import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // todo lo que empiece por /service/audit
      '/service/audit': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // mantiene el mismo path, p.ej. /service/audit/show-alerts → 3001/service/audit/show-alerts
      }
    }
  }
})
