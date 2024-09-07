import { BrowserBreadcrumbTypes, BrowserPluginTypes, CategoryTypes, BehaviorTypes } from '@ny/monitor-shared';
import { htmlElementAsString, on, throttle, _global } from '@ny/monitor-utils';
import { BasePluginType } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { addBreadcrumbInBrowser } from '../../utils';

export interface DomCollectedType {
  // maybe will add doubleClick or other in the future
  category: CategoryTypes;
  type: BehaviorTypes;
  data: Document;
}

/**
 * dom 插件
 */
const domPlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.DOM,
  monitor(notify) {
    if (!('document' in _global)) return;
    const clickThrottle = throttle(notify, this.options.throttleDelayTime);
    // 监听click
    on(
      _global.document,
      'click',
      function () {
        clickThrottle(BrowserPluginTypes.DOM, {
          category: CategoryTypes.BEHAVIOR,
          type: BehaviorTypes.CLICK,
          data: this
        });
      },
      true
    );
  },
  transform(collectedData: DomCollectedType) {
    const htmlString = htmlElementAsString(collectedData.data.activeElement as HTMLElement);
    return htmlString;
  },
  consumer(transformedData: string) {
    if (transformedData) {
      addBreadcrumbInBrowser.call(this, transformedData, CategoryTypes.BEHAVIOR, BrowserBreadcrumbTypes.CLICK);
    }
  }
};

export default domPlugin;
