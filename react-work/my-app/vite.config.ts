import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Прокси для Google Books API
      '/google-books-api': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-books-api/, '')
      },
      // Прокси для загрузки изображений с books.google.com
      '/book-images': {
        target: 'https://books.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/book-images/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    }
  }
})