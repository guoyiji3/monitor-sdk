import { BasePluginType } from '@ny/monitor-types';
import { BrowserClient } from './browserClient';
import { BrowserOptionsFieldsTypes } from './types';
import fetchPlugin from './plugins/stable/fetch';
import xhrPlugin from './plugins/stable/xhr';
import domPlugin from './plugins/behavior/dom';
import errorPlugin from './plugins/stable/error';
import hashRoutePlugin from './plugins/behavior/hashRoute';
import historyRoutePlugin from './plugins/behavior/historyRoute';
import consolePlugin from './plugins/behavior/console';
import unhandlerejectionPlugin from './plugins/stable/unhandlerejecttion';
import perfumePlugin from './plugins/performance/perfume';

/**
 * 创建SDK实例
 * @param options
 * @param plugins
 * @returns
 */
function createBrowserInstance(options: BrowserOptionsFieldsTypes = {}, plugins: BasePluginType[] = []) {
  try {
    const browserClient = new BrowserClient(options);
    const browserPlugins = [
      fetchPlugin,
      xhrPlugin,
      domPlugin,
      errorPlugin,
      hashRoutePlugin,
      historyRoutePlugin,
      consolePlugin,
      unhandlerejectionPlugin,
      perfumePlugin
    ];
    // 插件注册
    browserClient.use([...browserPlugins, ...plugins] as BasePluginType[]);
    return browserClient;
  } catch (err) {
    console.log('monitorSDK init fail');
  }
}

const initMonitorSDK = createBrowserInstance;
export { createBrowserInstance, initMonitorSDK, BrowserClient };
