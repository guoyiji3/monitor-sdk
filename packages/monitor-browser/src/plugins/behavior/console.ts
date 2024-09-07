import { BrowserBreadcrumbTypes, BrowserPluginTypes, CategoryTypes, globalVar, BehaviorTypes } from '@ny/monitor-shared';
import { replaceOld, Severity, _global } from '@ny/monitor-utils';
import { BasePluginType, ConsoleCollectType } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { addBreadcrumbInBrowser } from '../../utils';

/**
 * console 插件
 */
const consolePlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.CONSOLE,
  monitor(notify) {
    if (!('console' in _global)) {
      return;
    }
    const logType = ['log', 'debug', 'info', 'warn', 'error', 'assert'];
    logType.forEach(function (level: string): void {
      if (!(level in _global.console)) return;
      // 重写console事件
      replaceOld(_global.console, level, function (originalConsole: () => any): Function {
        return function (...args: any[]): void {
          if (originalConsole) {
            // 上报
            notify(BrowserPluginTypes.CONSOLE, { category: CategoryTypes.BEHAVIOR, type: BehaviorTypes.CONSOLE, args, level });
            originalConsole.apply(_global.console, args);
          }
        };
      });
    });
  },
  transform(collectedData: ConsoleCollectType) {
    return collectedData;
  },
  consumer(transformedData: ConsoleCollectType) {
    if (globalVar.isLogAddBreadcrumb) {
      addBreadcrumbInBrowser.call(
        this,
        transformedData,
        transformedData.category,
        BrowserBreadcrumbTypes.CONSOLE,
        Severity.fromString(transformedData.level)
      );
    }
  }
};

export default consolePlugin;
