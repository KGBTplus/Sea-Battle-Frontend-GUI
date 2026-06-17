import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    proxy: {
      '/api': {
        // Стучимся локально через домен, чтобы Ingress сам разруливал запросы
        target: 'http://team4.verstack.ru', 
        changeOrigin: true,
        ws: true
      }
    }
  }
})