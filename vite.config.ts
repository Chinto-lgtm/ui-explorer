import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Static-hostable anywhere. GitHub Pages serves project sites under /<repo>/,
// so the deploy workflow sets VITE_BASE_PATH=/ui-explorer/; every other host uses "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})
