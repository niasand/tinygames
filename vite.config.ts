import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  resolve: {
    alias: {
      '@/types': path.resolve(__dirname, "./src/@types")
    }
  },
  plugins: [react()],
  optimizeDeps: {
    // random-seedable is CommonJS; force pre-bundling so the module Web Worker
    // (which imports it via utils/game.ts) gets an ESM build instead of hanging
    // the ?worker_file transform in dev.
    include: ['random-seedable'],
  },
})
