import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

// ✅ Your existing config — unchanged, just extended to include redirects copy
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        try {
          copyFileSync('public/_redirects', 'dist/_redirects')
          console.log('✅ Copied _redirects file into dist/')
        } catch (err) {
          console.error('⚠️ Failed to copy _redirects file:', err)
        }
      },
    },
  ],
})
