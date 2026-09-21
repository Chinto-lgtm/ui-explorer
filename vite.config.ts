import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// Static-hostable anywhere. GitHub Pages serves project sites under /<repo>/,
// so the deploy workflow sets VITE_BASE_PATH=/ui-explorer/; every other host uses "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // The app version comes from package.json so a release is one edit + one tag.
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react()],
})
