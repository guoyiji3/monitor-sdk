import { BaseOptionsFieldsIntegrationType } from '@ny/monitor-types';

/**
 *browser silent event types
 * @interface BrowsersilentOptionsType
 */
export interface BrowsersilentOptionsType {
  /**
   * 默认会监控xhr，为true时，将不再监控
   */
  silentXhr?: boolean;
  /**
   * 默认会监控fetch，为true时，将不再监控
   */
  silentFetch?: boolean;
  /**
   * 默认会监控console，为true时，将不再监控
   */
  silentConsole?: boolean;
  /**
   * 默认会监听click事件，当用户点击的标签不是body时就会被放入breadcrumb，为true，将不在监听
   */
  silentDom?: boolean;
  /**
   * 默认会监控popstate、pushState、replaceState，为true时，将不再监控
   */
  silentHistory?: boolean;
  /**
   * 默认会监控hashchange，为true时，将不在监控
   */
  silentHashchange?: boolean;
  /**
   * 默认会监控性能
   */
  silentPerformance?: boolean;
  /**
   * 默认会监控error，为true时，将不在监控
   */
  silentError?: boolean;
  /**
   * 默认会监控unhandledrejection，为true时，将不在监控
   */
  silentUnhandledrejection?: boolean;
}

export interface BrowserOptionsHooksType {
  /**
   * 钩子函数，配置发送到服务端的xhr
   * 可以对当前xhr实例做一些配置：xhr.setRequestHeader()、xhr.withCredentials
   * @param {XMLHttpRequest} xhr XMLHttpRequest的实例
   * @param {*} reportData 上报的数据
   * @memberof BrowserOptionsHooksType
   */
  configReportXhr?(xhr: XMLHttpRequest, reportData: any): void;

  /**
   * 自定义处理业务报错，返回true会上报，false不上报
   * @param data 接口响应数据
   */
  apiCustomReportField?(data: unknown): boolean;
}

/**
 * 浏览器配置字段类型定义
 */
export interface BrowserOptionsFieldsTypes
  extends BrowsersilentOptionsType,
    BaseOptionsFieldsIntegrationType,
    BrowserOptionsHooksType {
  /**
   * 默认为sendBeacon，默认是sendBeacon的上报方式，若浏览器不支持会自动降级为xhr
   * 可选值：img | xhr | sendBeacon
   */
  uploadMode?: string;

  /**
   * 服务端时间校验接口地址
   */
  serverTimeCheckDsn?: string;
}
