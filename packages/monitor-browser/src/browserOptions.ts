import { BaseOptions } from '@ny/monitor-core';
import { ToStringTypes } from '@ny/monitor-shared';
import { validateOptionsAndSet } from '@ny/monitor-utils';
import { BrowserOptionsFieldsTypes } from './types';

/**
 * 浏览器相关配置参数
 */
export class BrowserOptions extends BaseOptions<BrowserOptionsFieldsTypes> {
  /**
   * 静默监控xhr事件
   */
  silentXhr = false;

  /**
   * 静默监控fetch事件
   */
  silentFetch = false;

  /**
   * 静默监控console事件
   */
  silentConsole = false;

  /**
   * 静默监控Dom事件
   */
  silentDom = false;

  /**
   * 静默监控history事件
   */
  silentHistory = false;

  /**
   * 静默监控error事件
   */
  silentError = false;

  /**
   * 静默监控unhandledrejection事件
   */
  silentUnhandledrejection = false;

  /**
   * 静默监控hashchange事件
   */
  silentHashchange = false;

  /**
   * 静默监控页面性能
   */
  silentPerformance = false;

  /**
   * 上报模式：sendBeacon(默认值 - 若不支持自动降级为xhr) | xhr | img
   */
  uploadMode = 'sendBeacon';

  /**
   * 支持业务接口自定义上报
   */
  apiCustomReportField;

  /**
   * 服务端时间校准服务地址
   */
  serverTimeCheckDsn = '';

  configReportXhr: unknown = null;

  constructor(options: BrowserOptionsFieldsTypes) {
    super();
    super.bindOptions(options);
    this.bindOptions(options);
  }

  bindOptions(options: BrowserOptionsFieldsTypes) {
    const {
      silentXhr,
      silentFetch,
      silentConsole,
      silentDom,
      silentHistory,
      silentError,
      silentHashchange,
      silentPerformance,
      silentUnhandledrejection,
      uploadMode,
      serverTimeCheckDsn,
      configReportXhr,
      apiCustomReportField
    } = options;
    const booleanType = ToStringTypes.Boolean;
    const optionArr: [unknown, string, ToStringTypes][] = [
      [silentXhr, 'silentXhr', booleanType],
      [silentFetch, 'silentFetch', booleanType],
      [silentConsole, 'silentConsole', booleanType],
      [silentDom, 'silentDom', booleanType],
      [silentHistory, 'silentHistory', booleanType],
      [silentError, 'silentError', booleanType],
      [silentHashchange, 'silentHashchange', booleanType],
      [silentPerformance, 'silentPerformance', booleanType],
      [silentUnhandledrejection, 'silentUnhandledrejection', booleanType],
      [uploadMode, 'uploadMode', ToStringTypes.String],
      [serverTimeCheckDsn, 'serverTimeCheckDsn', ToStringTypes.String],
      [configReportXhr, 'configReportXhr', ToStringTypes.Function],
      [apiCustomReportField, 'apiCustomReportField', ToStringTypes.Function]
    ];
    validateOptionsAndSet.call(this, optionArr);
  }
}
