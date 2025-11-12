import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true, // bind 0.0.0.0 để Render detect port
    port: 4173, // Render sẽ override bằng $PORT
    allowedHosts: ['zalomini-fontend.onrender.com'], // thêm host Render
  },
})
