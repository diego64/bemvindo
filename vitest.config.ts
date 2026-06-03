import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/testes/**/*.test.ts'],
    // Testes E2E compartilham o mesmo banco de testes — execução sequencial evita conflitos
    maxWorkers: 1,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/modulos/**/*.ts', 'src/compartilhado/**/*.ts'],
      exclude: ['src/testes/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
