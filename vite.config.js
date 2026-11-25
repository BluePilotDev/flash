import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // relative asset paths so the site works from a GitHub Pages project path (/flash/)
  base: './',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Inline @commaai/qdl to fix ESM resolution issues (missing .js extensions in imports)
    deps: {
      inline: ['@commaai/qdl'],
    },
  },
})
