import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@ny/monitor-browser': resolve(__dirname, 'packages/monitor-browser/index.ts'),
      '@ny/monitor-core': resolve(__dirname, 'packages/monitor-core/index.ts'),
      '@ny/monitor-shared': resolve(__dirname, 'packages/monitor-shared/index.ts'),
      '@ny/monitor-types': resolve(__dirname, 'packages/monitor-types/index.ts'),
      '@ny/monitor-utils': resolve(__dirname, 'packages/monitor-utils/index.ts'),
      '@ny/monitor-vue': resolve(__dirname, 'packages/monitor-vue/index.ts'),
      '@ny/monitor-business': resolve(__dirname, 'packages/monitor-business/index.ts')
    }
  },
  test: {
    // 测试环境
    environment: 'jsdom',
    // 超时时间
    testTimeout: 10000,
    // 匹配包含测试文件
    coverage: {
      include: ['**/packages/**'],

      extension: ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts']
    },
    setupFiles: ['./test/server.ts']
  }
});
