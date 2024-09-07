import { BrowserBreadcrumbTypes, BrowserPluginTypes, StableTypes, ERROR_TYPE_RE, CategoryTypes } from '@ny/monitor-shared';
import { extractErrorStack, getLocationHref, interceptStr, isError, on, Severity, _global } from '@ny/monitor-utils';
import { BasePluginType, ReportDataType } from '@ny/monitor-types';
import { BrowserClient } from '../../browserClient';
import { addBreadcrumbInBrowser } from '../../utils';

/**
 * 资源错误目标对象
 */
export interface ResourceErrorTarget {
  src?: string;
  href?: string;
  localName?: string;
}

/**
 * 错误监控插件（resource + onerror）
 */
const errorPlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.ERROR,
  monitor(notify) {
    // 监听全局error
    on(
      _global,
      'error',
      function (e: ErrorEvent) {
        // 出发事件发布
        notify(BrowserPluginTypes.ERROR, e);
      },
      true
    );
  },
  transform(errorEvent: ErrorEvent) {
    const target = errorEvent.target as ResourceErrorTarget;
    // resource error
    if (target.localName) {
      return resourceTransform(errorEvent.target as ResourceErrorTarget);
    }
    // code error
    return codeErrorTransform(errorEvent);
  },
  consumer(transformedData: ReportDataType) {
    const category = CategoryTypes.STABLE;
    transformedData.category = category;
    const type =
      transformedData.type === StableTypes.RESOURCE ? BrowserBreadcrumbTypes.RESOURCE : BrowserBreadcrumbTypes.CODE_ERROR;
    // 入栈
    const breadcrumbStack = addBreadcrumbInBrowser.call(this, transformedData, category, type, Severity.Error);
    // 上报
    this.transport.send(transformedData, breadcrumbStack);
  }
};

// const resourceMap = {
//   img: '图片',
//   script: 'JS脚本',
//   link: 'CSS样式'
// }

/**
 * 资源报错数据格式处理
 * @param target
 * @returns
 */
function resourceTransform(target: ResourceErrorTarget) {
  return {
    type: StableTypes.RESOURCE,
    message: `资源地址: ${interceptStr(target.src, 120) || interceptStr(target.href, 120)}`,
    level: Severity.High,
    subType: target.localName
  };
}

/**
 * 代码报错数据格式处理
 * @param errorEvent
 * @returns
 */
function codeErrorTransform(errorEvent: ErrorEvent) {
  const { message, filename, lineno, colno, error } = errorEvent;
  let result: ReportDataType;
  if (error && isError(error)) {
    result = extractErrorStack(error, Severity.Error);
  }
  result || (result = handleNotErrorInstance(message, filename, lineno, colno));
  result.type = StableTypes.JAVASCRIPT;
  return result;
}

/**
 * 处理没有报错实例
 * @param message
 * @param filename
 * @param lineno
 * @param colno
 * @returns
 */
function handleNotErrorInstance(message: string, filename: string, lineno: number, colno: number) {
  let name: string | StableTypes = StableTypes.UNKNOWN;
  const url = filename || getLocationHref();
  let msg = message;
  const matches = message.match(ERROR_TYPE_RE);
  if (matches[1]) {
    name = matches[1];
    msg = matches[2];
  }
  const element = {
    url,
    func: StableTypes.UNKNOWN_FUNCTION,
    args: StableTypes.UNKNOWN,
    line: lineno,
    col: colno
  };
  return {
    subType: name,
    message: msg,
    level: Severity.Error,
    stack: [element]
  };
}

export default errorPlugin;
