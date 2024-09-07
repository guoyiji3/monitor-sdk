import { BrowserPluginTypes, HttpTypes, HTTP_CODE } from '@ny/monitor-shared';
import { getTimestamp, replaceOld, _global } from '@ny/monitor-utils';
import { BasePluginType, HttpCollectedType, HttpTransformedType, voidFun } from '@ny/monitor-types';
import { getBusinessErrorCode, businessInterfaceReport } from '@ny/monitor-business';
import { BrowserClient } from '../../browserClient';
import { apiCustomReport, getErrorCode } from '../../utils';
import { httpTransform, httpTransformedDataConsumer } from './xhr';

/**
 * fetch 插件
 */
const fetchPlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.FETCH,
  monitor(notify) {
    monitorFetch.call(this, notify);
  },
  transform(collectedData: HttpCollectedType) {
    return httpTransform(collectedData);
  },
  consumer(transformedData: HttpTransformedType) {
    httpTransformedDataConsumer.call(this, transformedData);
  }
};

/**
 * fetch 监听
 */
function monitorFetch(this: BrowserClient, notify: (eventName: BrowserPluginTypes, data: any) => void) {
  const { options, transport } = this;
  if (!('fetch' in _global)) {
    return;
  }
  // fetch重写
  replaceOld(_global, BrowserPluginTypes.FETCH, (originalFetch: voidFun) => {
    return function (url: string, config: Partial<Request> = {}): void {
      const startTime = getTimestamp();
      const method = config?.method || 'GET';
      // 上报数据格式处理
      const httpCollect: HttpCollectedType = {
        subType: HttpTypes.FETCH,
        startTime,
        request: {
          url,
          method,
          data: config?.body,
          withCredentials: config?.credentials
        },
        response: {}
      };

      // 自定义请求头
      const headers = new Headers(config.headers || {});
      Object.assign(headers, {
        setRequestHeader: headers.set
      });

      // 设置追踪ID
      options.setTraceId(url, (headerFieldName: string, traceId: string) => {
        httpCollect.request.traceId = traceId;
        headers.set(headerFieldName, traceId);
      });

      // 发请求前拦截
      options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, headers);
      config = {
        ...config,
        headers
      };

      // 黑名单
      const isBlock = transport.isSelfDsn(url) || transport.isSelfSeverTimeCheckDsn(url) || options.isFilterHttpUrl(url);

      // 执行请求
      return originalFetch.apply(_global, [url, config]).then(
        (res: Response) => {
          // 拷贝响应内容进行处理
          const resClone = res.clone();
          const endTime = getTimestamp();
          httpCollect.endTime = endTime;
          httpCollect.spendTime = endTime - startTime;
          httpCollect.response.status = resClone.status;
          httpCollect.response.statusText = resClone.statusText;
          // 文本内容处理
          resClone.text().then((data) => {
            // 黑名单不处理
            if (isBlock) return;
            httpCollect.response.data = data;
            // 业务码
            httpCollect.response.errorCode = getBusinessErrorCode?.(data) || getErrorCode(data, ['error_code', 'code']);
            // 支持自定义接口上报处理...
            const isError =
              resClone.status === HTTP_CODE.BAD_REQUEST ||
              resClone.status > HTTP_CODE.UNAUTHORIZED ||
              apiCustomReport(data, this.options.apiCustomReportField) ||
              businessInterfaceReport?.(data);

            if (isError) {
              // 上报
              notify(BrowserPluginTypes.FETCH, httpCollect);
            }
          });
          return res;
        },
        (err: Error) => {
          // 响应报错处理
          if (isBlock) return;
          const endTime = getTimestamp();
          httpCollect.endTime = endTime;
          httpCollect.spendTime = endTime - startTime;
          httpCollect.response.status = 0;
          notify(BrowserPluginTypes.FETCH, httpCollect);
          throw err;
        }
      );
    };
  });
}

export default fetchPlugin;
