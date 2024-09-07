import { deepCopy } from './helpers';

const cache: unknown[] = [];

/**
 * 获取缓存
 * @param useLocalCache
 * @returns
 */
export function getCache(useLocalCache?: boolean) {
  if (useLocalCache) {
    return JSON.parse(window.localStorage.getItem('fedmonitor-cache') || '{}');
  }
  return deepCopy(cache);
}

/**
 * 添加缓存
 * @param data
 * @param useLocalCache
 */
export function addCache(data, useLocalCache?: boolean) {
  cache.push(data);
  if (useLocalCache) {
    window.localStorage.setItem('fedmonitor-cache', JSON.stringify(cache));
  }
}

/**
 * 清除缓存
 * @param useLocalCache
 */
export function clearCache(useLocalCache?: boolean) {
  cache.length = 0;
  if (useLocalCache) {
    window.localStorage.removeItem('fedmonitor-cache');
  }
}
