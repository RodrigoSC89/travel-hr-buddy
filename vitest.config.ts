// ✅ vitest.config.ts (atualizado para coverage)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      all: true,
      include: ['components/**/*', 'hooks/**/*', 'lib/**/*'],
    },
  },
});
