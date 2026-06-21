import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Mirrors vite.config.ts alias so '@/types/*' resolves in tests too.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/types': path.resolve(__dirname, './src/@types'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
