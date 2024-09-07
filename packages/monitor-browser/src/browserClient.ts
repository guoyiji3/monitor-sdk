import { Breadcrumb, BaseClient } from '@ny/monitor-core';
import {
  BrowserBreadcrumbTypes,
  BrowserPluginTypes,
  CustomTypes,
  EventTypes,
  MonitorLogEmptyMsg,
  MonitorLogEmptyTag,
  Silent,
  CategoryTypes
} from '@ny/monitor-shared';
import {
  extractErrorStack,
  firstStrtoUppercase,
  isError,
  Severity,
  unknownToString,
  onBeforeunload,
  checkLocalTimeForInterval,
  runTimeCheck
} from '@ny/monitor-utils';
import { LogTypes } from '@ny/monitor-types';
import { BrowserOptions } from './browserOptions';
import { BrowserTransport } from './browserTransport';
import { BrowserOptionsFieldsTypes } from './types';

/**
 * 浏览器客户端
 */
export class BrowserClient extends BaseClient<BrowserOptionsFieldsTypes, EventTypes> {
  transport: BrowserTransport;

  options: BrowserOptions;

  breadcrumb: Breadcrumb<BrowserOptionsFieldsTypes>;

  constructor(options: BrowserOptionsFieldsTypes = {}) {
    super(options);
    this.options = new BrowserOptions(options);
    this.transport = new BrowserTransport(options);
    this.breadcrumb = new Breadcrumb(options);

    // 页面刷新、关闭监听
    onBeforeunload(() => {
      this.transport.reportDataByImmediate();
    });

    // 服务端时间校准
    if (this.options.serverTimeCheckDsn) {
      // 初始化执行校准
      runTimeCheck(
        this.options,
        () => {
          // 本地时间监听
          checkLocalTimeForInterval({ defaultInterval: 30000, mixTimeDiff: 10000 }, () => {
            // 时间异常再次校准
            runTimeCheck(this.options);
          });
        },
        () => {
          console.log('服务端时间校准失败');
        }
      );
    }
  }

  /**
   * 判断当前插件是否启用，用于browser的option
   * @param {BrowserPluginTypes} name
   * @return {*}
   * @memberof BrowserClient
   */
  isPluginEnable(name: BrowserPluginTypes): boolean {
    const silentField = `${Silent}${firstStrtoUppercase(name)}`;
    return !this.options[silentField];
  }

  /**
   * 自定义上报
   * @param data
   */
  tracker(data: LogTypes) {
    const { message = MonitorLogEmptyMsg, tag = MonitorLogEmptyTag, level = Severity.Critical, ex = '' } = data;
    let errorInfo;
    if (isError(ex)) {
      errorInfo = extractErrorStack(ex, level);
    }

    // 自定义上报告数据格式
    const error = {
      category: CategoryTypes.CUSTOMIZE,
      type: CustomTypes.LOG,
      subType: CustomTypes.LOG,
      level,
      message: unknownToString(message),
      customTag: unknownToString(tag),
      ...errorInfo
    };

    // 行为栈
    const breadcrumbStack = this.breadcrumb.push({
      category: CategoryTypes.CUSTOMIZE,
      type: BrowserBreadcrumbTypes.CUSTOM,
      data: message,
      level: Severity.fromString(level.toString())
    });

    // 上报
    this.transport.send(error, breadcrumbStack);
  }
}
