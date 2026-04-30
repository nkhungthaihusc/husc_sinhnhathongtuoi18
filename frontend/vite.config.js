import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Gom tất cả các endpoint vào một cấu hình proxy duy nhất
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    allowedHosts: [
      'motels-survey-msie-motorola.trycloudflare.com'
    ]
  }
});