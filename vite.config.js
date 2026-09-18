import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow MAPBOX_ACCESS_TOKEN (public pk.*) in client code alongside VITE_*.
  envPrefix: ['VITE_', 'MAPBOX_'],
  server: {
    host: true, // listen on 0.0.0.0 so phones on the LAN can open via PC IP
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})
