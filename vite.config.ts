import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // The complete 3,600-word dataset is an intentional lazy-loaded data chunk.
    chunkSizeWarningLimit: 600,
  },
})
