import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/students': 'http://localhost:3000',
      '/blood-programs': 'http://localhost:3000',
      '/blood-registers': 'http://localhost:3000',
      '/notifications': 'http://localhost:3000'
    },
    allowedHosts: [
      'motels-survey-msie-motorola.trycloudflare.com'
    ]
  }
});
