import { EventTypes, SDK_VERSION, SDK_NAME } from '@ny/monitor-shared';
import { BaseClientType, BaseOptionsFieldsIntegrationType, BasePluginType, LogTypes } from '@ny/monitor-types';
import { logger } from '@ny/monitor-utils';
import { Subscribe } from './subscribe';
import { BaseTransport, Breadcrumb } from '.';

/**
 * 抽象客户端，已实现插件和钩子函数的定义
 * 如果目前的钩子函数满足不了业务，需要在use中额外添加钩子，并在各个端实现
 *
 * @export
 * @abstract
 * @class BaseClient
 * @implements {BaseClientType}
 * @template O
 * @template E
 */
export abstract class BaseClient<
  O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType,
  E extends EventTypes = EventTypes
> implements BaseClientType
{
  SDK_NAME = SDK_NAME;

  SDK_VERSION = SDK_VERSION;

  options: BaseOptionsFieldsIntegrationType;

  abstract breadcrumb: Breadcrumb;

  abstract transport: BaseTransport;

  constructor(options: O) {
    this.options = options;
    logger.bindOptions(options.debug as boolean);
  }

  /**
   * 引用插件
   *
   * @param {BasePluginType<E>[]} plugins
   * @memberof BaseClient
   */
  use(plugins: BasePluginType<E>[]) {
    if (this.options.disabled) return;
    // 新建发布订阅实例
    const subscribe = new Subscribe<E>();
    plugins.forEach((item) => {
      if (!this.isPluginEnable(item.name)) return;
      try {
        // 调用插件中的monitor并将发布函数传入
        item.monitor.call(this, subscribe.notify.bind(subscribe));
        const wrapperTransform = (...args: any) => {
          // 先执行transform
          const res = item.transform?.apply(this, args);
          // 拿到transform返回的数据并传入
          item.consumer?.call(this, res);
          // 如果需要新增hook，可在这里添加逻辑
        };
        // 订阅插件中的名字，并传入回调函数
        subscribe.watch(item.name, wrapperTransform);
      } catch (error) {
        console.log(`plugin ${item.name} error`, error);
      }
    });
  }

  getOptions() {
    return this.options;
  }

  /**
   * 判断当前插件是否启用，每个端的可选字段不同，需要子类实现
   *
   * @abstract
   * @param {EventTypes} name
   * @return {*}  {boolean}
   * @memberof BaseClient
   */
  abstract isPluginEnable(name: EventTypes): boolean;

  /**
   * 手动上报方法，每个端需要自己实现
   * @abstract
   * @param {LogTypes} data
   * @memberof BaseClient
   */
  abstract tracker(data: LogTypes): void;
}
