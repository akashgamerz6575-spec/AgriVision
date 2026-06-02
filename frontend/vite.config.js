import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'sprout-icon.png'],
      manifest: {
        name: 'AgriShield',
        short_name: 'AgriShield',
        description: 'Advanced Agro AI Advisor',
        theme_color: '#047857',
        icons: [
          {
            src: 'sprout-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'sprout-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
