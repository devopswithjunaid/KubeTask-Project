import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'),
    host: '0.0.0.0', // Allow external connections
    strictPort: true,
    // Remove proxy - we'll use direct API calls to localhost:8000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Ensure environment variables are available
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000'),
  }
})
