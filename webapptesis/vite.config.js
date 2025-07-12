// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // 1) Carga las variables de entorno de `.env`, `.env.development` o `.env.production`
  //    El tercer parámetro '' hace que cargue TODAS las vars, no sólo las VITE_*
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/service/audit': {
          // 2) Ahora sí existe `env.VITE_AUDIT_BASE_URL`
          target: env.VITE_AUDIT_BASE_URL,
          changeOrigin: true,
          secure: false,
        }
        
        // ...otros proxies si los necesitas
      }
    }
  })
}
