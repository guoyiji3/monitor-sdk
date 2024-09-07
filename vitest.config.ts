import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@ny/luban': resolve(__dirname, 'packages/luban-core/index.ts'),
      '@ny/luban-map': resolve(__dirname, 'packages/luban-map/index.ts'),
      '@ny/luban-uniapp': resolve(__dirname, 'packages/luban-uniapp/index.ts'),
      '@ny/luban-shared': resolve(__dirname, 'packages/luban-shared/index.ts'),
      '@ny/luban-ladder': resolve(__dirname, 'packages/luban-ladder/index.ts')
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
