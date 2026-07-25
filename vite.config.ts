import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/btc-dashboard/',
  server: {
    port: parseInt(process.env.PORT ?? '5173'),
  },
})
