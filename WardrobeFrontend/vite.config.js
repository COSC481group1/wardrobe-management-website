import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // `npm run dev` only: forward backend calls to the C# API so the browser
    // sees a single origin (no CORS setup, no self-signed-cert warning).
    // Add more controller prefixes here as the frontend starts calling them.
    proxy: {
      '/User': { target: 'https://localhost:7163', secure: false }
    }
  },
  build: {
    outDir: '../WardrobeBackend/wwwroot',
    emptyOutDir: true
  }
})
