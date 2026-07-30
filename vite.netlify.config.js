import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração específica para o Netlify (App Independente)
export default defineConfig({
  plugins: [react()],
})
