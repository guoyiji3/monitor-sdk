import { ToStringTypes } from '@ny/monitor-shared';
import { BaseOptionsFieldsIntegrationType, BaseOptionsType } from '@ny/monitor-types';
import { generateUUID, validateOptionsAndSet } from '@ny/monitor-utils';

/**
 * 公共基础配置项
 * @export
 * @class BaseOptions
 * @implements {BaseOptionsType<O>}
 * @template O
 */
export class BaseOptions<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType>
  implements BaseOptionsType<O>
{
  enableTraceId = false;

  includeHttpUrlTraceIdRegExp = /.*/;

  traceIdFieldName = 'Trace-Id';

  throttleDelayTime = 0;

  filterXhrUrlRegExp;

  vue;

  bindOptions(options: O) {
    const {
      enableTraceId,
      vue,
      filterXhrUrlRegExp,
      traceIdFieldName,
      throttleDelayTime,
      includeHttpUrlTraceIdRegExp,
      beforeAppAjaxSend
    } = options;
    const optionArr: [any, string, ToStringTypes][] = [
      [enableTraceId, 'enableTraceId', ToStringTypes.Boolean],
      [traceIdFieldName, 'traceIdFieldName', ToStringTypes.String],
      [throttleDelayTime, 'throttleDelayTime', ToStringTypes.Number],
      [filterXhrUrlRegExp, 'filterXhrUrlRegExp', ToStringTypes.RegExp],
      [includeHttpUrlTraceIdRegExp, 'includeHttpUrlTraceIdRegExp', ToStringTypes.RegExp],
      [beforeAppAjaxSend, 'beforeAppAjaxSend', ToStringTypes.Function]
    ];
    validateOptionsAndSet.call(this, optionArr);
    this.vue = vue;
  }

  /**
   * 接口拦截黑名单
   * @param url
   * @returns
   */
  isFilterHttpUrl(url: string): boolean {
    return this.filterXhrUrlRegExp?.test(url);
  }

  /**
   * 设置上报ID
   * @param httpUrl
   * @param callback
   */
  setTraceId(httpUrl: string, callback: (headerFieldName: string, traceId: string) => void) {
    const { includeHttpUrlTraceIdRegExp, enableTraceId } = this;
    if (enableTraceId && includeHttpUrlTraceIdRegExp && includeHttpUrlTraceIdRegExp.test(httpUrl)) {
      const traceId = generateUUID();
      callback(this.traceIdFieldName, traceId);
    }
  }
}
