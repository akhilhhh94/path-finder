import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/path-finder/' : '/',
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})