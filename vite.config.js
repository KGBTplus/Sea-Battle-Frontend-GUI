import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://2.56.241.145:30080',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
