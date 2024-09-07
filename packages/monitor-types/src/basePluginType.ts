import { CategoryTypes, EventTypes, BehaviorTypes, RouteTypes } from '@ny/monitor-shared';
import { BaseClientType } from './baseClientType';

/**
 * 插件接口声明
 */
export interface BasePluginType<T extends EventTypes = EventTypes, C extends BaseClientType = BaseClientType> {
  // 插件名称
  name: T;
  // 监控事件，并在该事件中用notify通知订阅中心
  monitor: (this: C, notify: (eventName: T, data: any) => void) => void;
  // 在monitor中触发数据并将数据传入当前函数，拿到数据做数据格式转换(会将tranform放入Subscrib的handers)
  transform?: (this: C, collectedData: any) => any;
  // 拿到转换后的数据进行breadcrumb、report等等操作
  consumer?: (this: C, transformedData: any) => void;
}

export interface RouteChangeCollectType {
  category: CategoryTypes;
  type: BehaviorTypes;
  subType: RouteTypes;
  from: string;
  to: string;
}

export interface ConsoleCollectType {
  category: CategoryTypes;
  type: BehaviorTypes;
  args: any[];
  level: string;
}
