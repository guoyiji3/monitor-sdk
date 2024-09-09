import { MethodTypes, ToStringTypes } from '@ny/monitor-shared';
import { getTimestamp, safeStringify, toStringValidateOption, getLocationHref, getLocationTitle } from '@ny/monitor-utils';
import { getTransportDataNew } from '@ny/monitor-business';
import { ReportDataType } from '@ny/monitor-types';
import { BaseTransport } from '@ny/monitor-core';
import { BrowserOptionsFieldsTypes } from './types';

/**
 * 浏览器上报
 */
export class BrowserTransport extends BaseTransport<BrowserOptionsFieldsTypes> {
  configReportXhr: unknown;

  uploadMode = 'sendBeacon';

  constructor(options: BrowserOptionsFieldsTypes = {}) {
    super();
    super.bindOptions(options);
    this.bindOptions(options);
  }

  // sendBeacon上报方式
  sendByBeacon(data: any, url: string) {
    const isSupportSendBeacon = () => {
      return !!window.navigator?.sendBeacon;
    };
    const requestFun = (): void => {
      window.navigator.sendBeacon(url, JSON.stringify(data));
    };
    isSupportSendBeacon() ? this.queue.addTask(requestFun) : this.post(data, url);
  }

  // xhr上报方式
  post(data: any, url: string) {
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest();
      xhr.open(MethodTypes.Post, url);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.withCredentials = true;
      if (typeof this.configReportXhr === 'function') {
        this.configReportXhr(xhr, data);
      }
      xhr.send(safeStringify(data));
    };
    this.queue.addTask(requestFun);
  }

  // image上报方式
  imgRequest(data: any, url: string): void {
    const requestFun = () => {
      const img = new Image();
      const spliceStr = url.indexOf('?') === -1 ? '?' : '&';
      img.src = `${url}${spliceStr}data=${encodeURIComponent(safeStringify(data))}`;
    };
    this.queue.addTask(requestFun);
  }

  // 上报
  sendToServer(data: any, url: string) {
    const list = getTransportDataNew(data, this);
    switch (this.uploadMode) {
      case 'xhr':
        return this.post(list, url);
      case 'img':
        return this.imgRequest(list, url);
      default:
        return this.sendByBeacon(list, url);
    }
  }

  // 组装上报数据
  // eslint-disable-next-line class-methods-use-this
  getTransportData(data: ReportDataType) {
    // 上报公共属性
    const commonAttr = {
      pageUrl: getLocationHref(),
      pageTitle: getLocationTitle(),
      timestamp: getTimestamp()
    };
    return {
      data: { ...data, ...commonAttr }
    };
  }

  // 参数绑定
  bindOptions(options: BrowserOptionsFieldsTypes = {}) {
    const { configReportXhr, uploadMode = 'sendBeacon' } = options;
    toStringValidateOption(configReportXhr, 'configReportXhr', ToStringTypes.Function) &&
      (this.configReportXhr = configReportXhr);
    toStringValidateOption(uploadMode, 'uploadMode', ToStringTypes.String) && (this.uploadMode = uploadMode);
  }
}
