import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Force exit if port is busy, don't switch to 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})