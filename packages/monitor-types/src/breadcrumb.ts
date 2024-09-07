import { Severity } from '@ny/monitor-utils';
import { CategoryTypes, BreadcrumbTypes } from '@ny/monitor-shared';
import { ReportDataType } from './transport';
import { TNumStrObj } from './common';
import { ConsoleCollectType, RouteChangeCollectType } from './basePluginType';

/**
 * 行为栈接口定义
 */
export interface BreadcrumbPushData {
  /**
   * 分为stable、behavior、performance、customize
   */
  category?: CategoryTypes;
  /**
   * 事件类型
   */
  type: BreadcrumbTypes;
  /**
   * 入栈数据
   */
  data: ReportDataType | RouteChangeCollectType | ConsoleCollectType | TNumStrObj;
  /**
   * 入栈时间戳
   */
  time?: number;
  /**
   * 级别
   */
  level: Severity;
}
