import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Espelha o alias `@/*` do tsconfig.json. Sem isso os módulos sob teste
    // não resolvem os próprios imports.
    alias: { '@': resolve(import.meta.dirname, '.') },
  },
  test: {
    // Route handlers e libs rodam no servidor; nada aqui precisa de DOM.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
  },
})
