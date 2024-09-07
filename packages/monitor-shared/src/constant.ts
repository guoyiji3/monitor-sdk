import { BrowserBreadcrumbTypes, BrowserPluginTypes } from './browser';
import { WxBreadcrumbTypes, WxEventTypes } from './wx';

/**
 * 一级分类：
 * 稳定性
 * 用户行为
 * 性能
 * 自定义
 */
export const enum CategoryTypes {
  STABLE = 'stable',
  BEHAVIOR = 'behavior',
  PERFORMANCE = 'performance',
  CUSTOMIZE = 'customize'
}

// 稳定性指标
export const enum StableTypes {
  UNKNOWN = 'unknown',
  UNKNOWN_FUNCTION = 'unknown_function',
  JAVASCRIPT = 'javaScript',
  HTTP = 'http',
  VUE = 'vue',
  REACT = 'react',
  RESOURCE = 'resource',
  PROMISE = 'promise'
}

// 用户行为指标
export const enum BehaviorTypes {
  ROUTE = 'route',
  CLICK = 'click',
  SCROLL = 'scroll',
  MOUSE = 'mouse',
  CONSOLE = 'console'
}

// 路由模式
export const enum RouteTypes {
  HASH = 'hash',
  HISTORY = 'history'
}

// 自定义指标
export const enum CustomTypes {
  LOG = 'log'
}

// JS错误指标
export const enum JavascriptTypes {
  ERROR = 'Error',
  INTERNALERROR = 'InternalError',
  EVALERROR = 'EvalError',
  RANGEERROR = 'RangeError',
  REFERENCEERROR = 'ReferenceError',
  SYNTAXERROR = 'SyntaxError',
  TYPEERROR = 'TypeError',
  URIERROR = 'URIError'
}

// 性能二级指标
export const enum PerformanceTypes {
  PAGE = 'page',
  RESOURCE = 'resource',
  API = 'api'
}

export const enum BaseBreadcrumbTypes {
  VUE = 'Vue',
  REACT = 'React'
}

/**
 * 用户行为栈事件类型
 */
export type BreadcrumbTypes = BrowserBreadcrumbTypes | WxBreadcrumbTypes | BaseBreadcrumbTypes;

export const MonitorLog = 'Monitor.log';
export const MonitorLogEmptyMsg = 'empty.msg';
export const MonitorLogEmptyTag = 'empty.tag';

export const enum BaseEventTypes {
  VUE = 'vue',
  REACT = 'react'
}

/**
 * 所有重写事件类型整合
 */
export type EventTypes = BrowserPluginTypes | WxEventTypes | BaseEventTypes;

export const enum HttpTypes {
  XHR = 'xhr',
  FETCH = 'fetch'
}

export const enum MethodTypes {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

export const enum HTTP_CODE {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_EXCEPTION = 500
}

export const enum ToStringTypes {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  RegExp = 'RegExp',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol',
  Object = 'Object',
  Array = 'Array',
  process = 'process',
  Window = 'Window',
  Function = 'Function'
}

export const ERROR_TYPE_RE =
  /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

const globalVar = {
  isLogAddBreadcrumb: true,
  crossOriginThreshold: 1000
};

export const Silent = 'silent';

export { globalVar };
