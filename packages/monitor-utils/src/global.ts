import { EventTypes } from '@ny/monitor-shared';
import { DeviceInfo } from '@ny/monitor-types';
import { Logger } from './logger';
import { variableTypeDetection } from './is';

/**
 * 全局变量
 * @export
 * @interface GlobalSupport
 */
export interface GlobalSupport {
  logger: Logger;
  replaceFlag: { [key in EventTypes]?: boolean };
  record?: any[];
  deviceInfo?: DeviceInfo;
}

interface MONITORGlobal {
  console?: Console;
  __MONITOR__?: GlobalSupport;
}

export const isNodeEnv = variableTypeDetection.isProcess(typeof globalThis.process !== 'undefined' ? globalThis.process : 0);

export const isWxMiniEnv =
  variableTypeDetection.isObject(typeof window.wx !== 'undefined' ? window.wx : 0) &&
  variableTypeDetection.isFunction(typeof window.App !== 'undefined' ? window.App : 0);

export const isBrowserEnv = variableTypeDetection.isWindow(typeof window !== 'undefined' ? window : 0);
/**
 * 获取全局变量
 * returns Global scope object
 */
// eslint-disable-next-line consistent-return
export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as MONITORGlobal & T;
  if (isWxMiniEnv) return window.wx as unknown as MONITORGlobal & T;
  // it's true when run e2e
  if (isNodeEnv) return globalThis.process as unknown as MONITORGlobal & T;
}

// whether it is right use &
const _global: any = getGlobal<Window>();
const _support = getGlobalSupport();

/**
 * 获取全局变量
 * @return {*}  {GlobalSupport}
 */
function getGlobalSupport(): GlobalSupport {
  _global.__MONITOR__ = _global.__MONITOR__ || ({} as GlobalSupport);
  return _global.__MONITOR__;
}

export { _global, _support };

export function supportsHistory(): boolean {
  // borrowed from: https://github.com/angular/angular.js/pull/13945/files
  const { chrome } = _global as any;
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
  const hasHistoryApi = 'history' in _global && !!_global.history.pushState && !!_global.history.replaceState;
  return !isChromePackagedApp && hasHistoryApi;
}
