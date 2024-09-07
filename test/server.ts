import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import handlers from './handlers';

const server = setupServer(...handlers);

// 在所有测试之前启动服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// 所有测试后关闭服务器
afterAll(() => server.close());

// 每次测试后重置处理程序 `对测试隔离很重要`
afterEach(() => server.resetHandlers());
