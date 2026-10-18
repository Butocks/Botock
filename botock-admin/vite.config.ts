import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/prod-proxy': {
        target: 'https://botock.app/api/proxy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/prod-proxy/, ''),
        headers: {
          'Origin': 'https://botock.app',
          'Referer': 'https://botock.app/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      },
    },
  },
})
