
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // A configuração base: './' é ESSENCIAL para hospedagem compartilhada (CPanel).
  // Ela garante que os caminhos dos assets (js/css) sejam relativos, 
  // permitindo que o site funcione em subpastas ou domínios diretos.
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
