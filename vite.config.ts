import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/DolrShop/',   // مهم جداً
  plugins: [react()],
})
