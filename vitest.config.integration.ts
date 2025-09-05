import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'integration',
    include: ['**/__tests__/integration/**/*.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['__tests__/setup.integration.ts'],
    testTimeout: 30000, // 30 seconds for AI calls
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/stores': path.resolve(__dirname, './stores'),
      '@/services': path.resolve(__dirname, './services'),
      '@/hooks': path.resolve(__dirname, './hooks'),
    },
  },
})