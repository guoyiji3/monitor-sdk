import { BrowserPluginTypes, CategoryTypes, BehaviorTypes, RouteTypes } from '@ny/monitor-shared';
import { getLocationHref, replaceOld, supportsHistory, _global } from '@ny/monitor-utils';
import { BasePluginType, RouteChangeCollectType, voidFun } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { routeTransform, routeTransformedConsumer } from './hashRoute';

/**
 * history 插件
 */
const historyRoutePlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.HISTORY,
  monitor(notify) {
    let lastHref: string;
    if (!supportsHistory()) return;
    const commonReportData = {
      category: CategoryTypes.BEHAVIOR,
      type: BehaviorTypes.ROUTE,
      subType: RouteTypes.HISTORY
    };
    // 重写onpopstate
    const oldOnpopstate = _global.onpopstate;
    _global.onpopstate = function (this: WindowEventHandlers, ...args: any[]): any {
      const to = getLocationHref();
      const from = lastHref;
      lastHref = to;
      notify(BrowserPluginTypes.HISTORY, {
        ...commonReportData,
        from,
        to
      });
      oldOnpopstate && oldOnpopstate.apply(this, args);
    };

    function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
      return function (this: History, ...args: any[]): void {
        const url = args.length > 2 ? args[2] : undefined;
        if (url) {
          const from = lastHref;
          const to = String(url);
          lastHref = to;
          notify(BrowserPluginTypes.HISTORY, {
            ...commonReportData,
            from,
            to
          });
        }
        return originalHistoryFn.apply(this, args);
      };
    }
    // 以下两个事件是人为调用，但是不触发onpopstate
    replaceOld(_global.history, 'pushState', historyReplaceFn);
    replaceOld(_global.history, 'replaceState', historyReplaceFn);
  },
  transform(collectedData: RouteChangeCollectType) {
    return routeTransform(collectedData);
  },
  consumer(transformedData: RouteChangeCollectType) {
    routeTransformedConsumer.call(this, transformedData, transformedData.category, transformedData.type);
  }
};

export default historyRoutePlugin;
