import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Esto evita que Vite genere hashes en el nombre (ej: configurator-d83j2.js)
        // Facilitando la actualización en Webflow o el CDN
        manualChunks: undefined,
        entryFileNames: `magic-configurator.js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
})