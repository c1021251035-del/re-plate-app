import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site: https://c1021251035-del.github.io/re-plate-app/
  base: "/re-plate-app/",
  plugins: [react()],
})
