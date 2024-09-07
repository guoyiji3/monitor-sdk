import { ReportDataType } from '@ny/monitor-types';
import { BrowserPluginTypes, StableTypes, CustomTypes } from '@ny/monitor-shared';
import { variableTypeDetection } from './is';

const allErrorNumber: any = {};

/**
 * generate error unique Id
 * @export
 * @param {ReportDataType} data 上报的数据结构
 * @param {string} apiKey 项目的唯一key
 * @param {number} maxDuplicateCount init配置项，最多可重复上报同一个错误的次数
 * @return {*}  {(number | null)}
 */
export function createErrorId(reportData: ReportDataType, apiKey: string, maxDuplicateCount: number): number | null {
  let id: any;
  const { data } = reportData;
  const projectType = apiKey + data?.category + data?.type + data?.subType;
  switch (data.type) {
    case StableTypes.HTTP:
      // eslint-disable-next-line no-use-before-define
      id = projectType + data?.request?.method + data?.response?.status + getRealPath(data?.request?.url);
      break;
    case StableTypes.JAVASCRIPT:
    case StableTypes.VUE:
    case StableTypes.REACT:
      id = projectType + data.message;
      break;
    case CustomTypes.LOG:
      id = data.customTag + projectType;
      break;
    case StableTypes.PROMISE:
      // eslint-disable-next-line no-use-before-define
      id = generatePromiseErrorId(data, apiKey);
      break;
    default:
      id = projectType + data.pageUrl + data.timestamp;
      break;
  }
  // eslint-disable-next-line no-use-before-define
  id = hashCode(id);
  if (allErrorNumber[id] >= maxDuplicateCount) {
    return null;
  }
  if (typeof allErrorNumber[id] === 'number') {
    // eslint-disable-next-line no-plusplus
    allErrorNumber[id]++;
  } else {
    allErrorNumber[id] = 1;
  }
  return id;
}
/**
 * 如果是UNHANDLEDREJECTION，则按照项目apiKey来生成
 * 如果是其他的，按照当前页面来生成
 * @param data
 * @param originUrl
 */
function generatePromiseErrorId(data: ReportDataType, apiKey: string) {
  // eslint-disable-next-line no-use-before-define
  const locationUrl = getRealPath(data.pageUrl as string);
  if (data.subType === BrowserPluginTypes.UNHANDLEDREJECTION) {
    // eslint-disable-next-line no-use-before-define
    return `${data.category}${data.type}${stringToObjAndOrder(data.message as string)}${apiKey}`;
  }
  // eslint-disable-next-line no-use-before-define
  return `${data.category}${data.type}${data.subType}${stringToObjAndOrder(data.message as string)}${locationUrl}`;
}

export function sortObjByKey<T = object>(obj): T {
  return Object.keys(obj)
    .sort()
    .reduce((total, key) => {
      if (variableTypeDetection.isObject(obj[key])) {
        total[key] = sortObjByKey(obj[key]);
      } else {
        total[key] = obj[key];
      }
      return total;
    }, {}) as T;
}

/**
 * sort object keys
 * ../param reason promise.reject
 */
export function stringToObjAndOrder(reason: string) {
  try {
    if (/\{.*\}/.test(reason)) {
      let obj = JSON.parse(reason);
      obj = sortObjByKey(obj);
      return JSON.stringify(obj);
    }
    return reason;
  } catch (error) {
    return reason;
  }
}

/**
 *
 * 获取去掉query后的地主
 * @export
 * @param {string} url 地址
 * @return {*}  {string}
 * @example http://.../project?id=1#a => http://.../project  http://.../id/123=> http://.../id/{param}
 */
export function getRealPath(url: string): string {
  return url
    .replace(/[?#].*$/, '')
    .replace(/\/(\d+)\//g, '/{param}/$1')
    .replace(/\/\d+([/]*$)/g, '/{param}$1');
}

/**
 *
 * @param url
 */
export function getFlutterRealOrigin(url: string): string {
  // for apple
  // eslint-disable-next-line no-use-before-define
  return removeHashPath(getFlutterRealPath(url));
}

/**
 * 获取flutter的原始地址：每个用户的文件夹hash不同
 * @param url
 */
export function getFlutterRealPath(url: string): string {
  // for apple
  return url.replace(/(\S+)(\/Documents\/)(\S*)/, `$3`);
}

export function removeHashPath(url: string): string {
  return url.replace(/(\S+)(\/#\/)(\S*)/, `$1`);
}

/**
 * 根据字符串生成hashcode
 *
 * @export
 * @param {string} str
 * @return {*}  {number} 可为正数和负数
 */
export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return hash;
}
