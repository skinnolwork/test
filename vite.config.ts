import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',   // ✅ 반드시 이렇게 되어야 함
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
