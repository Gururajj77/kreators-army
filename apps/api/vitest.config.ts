import { defineConfig } from 'vitest/config';

// Node tests for the Worker's modules (V2-SPEC 2.14). The MEGA fixtures are built once per run (globalSetup) and served by
// test/mega/mock-mega.mjs on a free 127.0.0.1 port. Nothing here reaches the network or the founder's real link.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    setupFiles: ['test/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
