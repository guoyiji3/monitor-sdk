import { BrowserBreadcrumbTypes, BrowserPluginTypes, CategoryTypes, BehaviorTypes, RouteTypes } from '@ny/monitor-shared';
import { isExistProperty, on, parseUrlToObj, _global } from '@ny/monitor-utils';
import { BasePluginType, RouteChangeCollectType } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { addBreadcrumbInBrowser } from '../../utils';

/**
 * hashchange 插件
 */
const hashRoutePlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.HASHCHANGE,
  monitor(notify) {
    // 非history模式
    if (!isExistProperty(_global, 'onpopstate')) {
      on(_global, BrowserPluginTypes.HASHCHANGE, function (e: HashChangeEvent) {
        const { oldURL: from, newURL: to } = e;
        notify(BrowserPluginTypes.HASHCHANGE, {
          category: CategoryTypes.BEHAVIOR,
          type: BehaviorTypes.ROUTE,
          subType: RouteTypes.HASH,
          from,
          to
        });
      });
    }
  },
  transform(collectedData: RouteChangeCollectType) {
    return routeTransform(collectedData);
  },
  consumer(transformedData: RouteChangeCollectType) {
    routeTransformedConsumer.call(this, transformedData);
  }
};

/**
 * 路由数据格式化
 * @param collectedData
 * @returns
 */
export function routeTransform(collectedData: RouteChangeCollectType): RouteChangeCollectType {
  const { from, to } = collectedData;
  const { relative: parsedFrom } = parseUrlToObj(from);
  const { relative: parsedTo } = parseUrlToObj(to);
  return {
    ...collectedData,
    from: parsedFrom || '/',
    to: parsedTo || '/'
  };
}

export function routeTransformedConsumer(this: BrowserClient, transformedData: RouteChangeCollectType) {
  if (transformedData.from === transformedData.to) return;
  addBreadcrumbInBrowser.call(this, transformedData, transformedData.category, BrowserBreadcrumbTypes.ROUTE);
}

export default hashRoutePlugin;
