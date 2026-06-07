import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/infra/http/servidor.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  bundle: true,
})
