import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/lib/router-compat.tsx'),
      'next/navigation': path.resolve(__dirname, './src/lib/router-compat.tsx'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
})
