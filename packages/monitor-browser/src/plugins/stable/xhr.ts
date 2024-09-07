import {
  BrowserBreadcrumbTypes,
  BrowserPluginTypes,
  StableTypes,
  globalVar,
  HttpTypes,
  HTTP_CODE,
  CategoryTypes
} from '@ny/monitor-shared';
import {
  getTimestamp,
  replaceOld,
  Severity,
  _global,
  variableTypeDetection,
  on,
  fromHttpStatus,
  SpanStatus,
  getRealPath
} from '@ny/monitor-utils';
import { getBusinessErrorCode, businessInterfaceReport } from '@ny/monitor-business';
import { BasePluginType, HttpCollectedType, HttpTransformedType, CustomXMLHttpRequest, voidFun } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { addBreadcrumbInBrowser, apiCustomReport, getErrorCode } from '../../utils';

/**
 * xhr 插件
 */
const xhrPlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.XHR,
  monitor(notify) {
    monitorXhr.call(this, notify);
  },
  transform(collectedData: HttpCollectedType) {
    return httpTransform(collectedData);
  },
  consumer(transformedData: HttpTransformedType) {
    httpTransformedDataConsumer.call(this, transformedData);
  }
};

/**
 * xhr 监听
 * @param this
 * @param notify
 * @returns
 */
function monitorXhr(this: BrowserClient, notify: (eventName: BrowserPluginTypes, data: any) => void) {
  const { options, transport } = this;
  if (!('XMLHttpRequest' in _global)) {
    return;
  }

  // 对原型进行重写
  const originalXhrProto = XMLHttpRequest.prototype;
  replaceOld(originalXhrProto, 'open', (originalOpen: voidFun): voidFun => {
    return function (this: CustomXMLHttpRequest, ...args: any[]): void {
      // 上报数据格式处理
      this.httpCollect = {
        subType: HttpTypes.XHR,
        startTime: getTimestamp(),
        request: {
          method: variableTypeDetection.isString(args[0]) ? args[0].toUpperCase() : args[0],
          url: args[1]
        },
        response: {}
      };
      originalOpen.apply(this, args);
    };
  });
  replaceOld(originalXhrProto, 'send', (originalSend: voidFun): voidFun => {
    return function (this: CustomXMLHttpRequest, ...args: any[]): void {
      const { request } = this.httpCollect;
      const { method, url } = request;
      // 设置追踪ID
      options.setTraceId(url, (headerFieldName: string, traceId: string) => {
        request.traceId = traceId;
        this.setRequestHeader(headerFieldName, traceId);
      });
      // 上报前处理
      options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, this);
      // 监听响应
      on(this, 'loadend', function (this: CustomXMLHttpRequest) {
        // 黑名单过滤
        const isBlock = transport.isSelfDsn(url) || transport.isSelfSeverTimeCheckDsn(url) || options.isFilterHttpUrl(url);
        if (isBlock) return;
        const { responseType, response, status, statusText, timeout, withCredentials } = this;
        request.data = args[0];
        request.withCredentials = withCredentials;
        const endTime = getTimestamp();
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          this.httpCollect.response.data = typeof response === 'object' ? JSON.stringify(response) : response;
        }
        this.httpCollect.response.status = status;
        this.httpCollect.response.statusText = statusText;
        this.httpCollect.response.timeout = timeout;
        this.httpCollect.endTime = endTime;
        this.httpCollect.spendTime = endTime - this.httpCollect.startTime;

        // 上报
        notify(BrowserPluginTypes.XHR, this.httpCollect);
      });
      originalSend.apply(this, args);
    };
  });
}

// xhr数据处理
export function httpTransform(httpCollectedData: HttpCollectedType): HttpTransformedType {
  let message = '';
  const {
    request: { url },
    response: { status, data },
    spendTime
  } = httpCollectedData;

  // 业务码
  httpCollectedData.response.errorCode = getBusinessErrorCode?.(data) || getErrorCode(data, ['error_code', 'code']);

  // 网络请求失败处理
  if (status === 0) {
    message =
      spendTime <= globalVar.crossOriginThreshold
        ? 'http请求失败，失败原因：跨域限制或域名不存在'
        : 'http请求失败，失败原因：超时';
  } else {
    message = fromHttpStatus(status);
  }

  message = message === SpanStatus.Ok ? message : `${message} ${getRealPath(url)}`;
  httpCollectedData.response.message = message;

  return {
    ...httpCollectedData,
    category: CategoryTypes.STABLE,
    type: StableTypes.HTTP,
    level: Severity.Low
  };
}

/**
 * 数据消费
 * @param this
 * @param transformedData
 */
export function httpTransformedDataConsumer(this: BrowserClient, transformedData: HttpTransformedType) {
  const type = transformedData.subType === HttpTypes.FETCH ? BrowserBreadcrumbTypes.FETCH : BrowserBreadcrumbTypes.XHR;
  // time 是为了保持顺序，紧跟在点击事件后面
  const {
    response: { status, data },
    startTime
  } = transformedData;

  // 网络请求失败
  const isError =
    status === 0 ||
    status === HTTP_CODE.BAD_REQUEST ||
    status > HTTP_CODE.UNAUTHORIZED ||
    apiCustomReport(data, this.options.apiCustomReportField) ||
    businessInterfaceReport?.(data);

  // 接口报错（网络层 + 业务层）
  if (isError) {
    transformedData.level = Severity.Error;
    // 入栈
    const breadcrumStack = addBreadcrumbInBrowser.call(this, transformedData, transformedData.category, type, Severity.Error, {
      time: startTime
    });
    // 上报
    this.transport.send(transformedData, breadcrumStack);
  } else {
    // 入栈
    addBreadcrumbInBrowser.call(this, transformedData, transformedData.category, type, Severity.Info, { time: startTime });
  }
}

export default xhrPlugin;
