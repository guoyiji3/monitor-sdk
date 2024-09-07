import { BrowserBreadcrumbTypes, CategoryTypes } from '@ny/monitor-shared'
import { Severity } from '@ny/monitor-utils'
import { BrowserClient } from './browserClient'

/**
 * 添加浏览器行为栈
 * @param this
 * @param data
 * @param type
 * @param level
 * @param params
 * @returns
 */
export function addBreadcrumbInBrowser(
  this: BrowserClient,
  data: any,
  category: CategoryTypes,
  type: BrowserBreadcrumbTypes,
  level = Severity.Info,
  params: any = {}
) {
  return this.breadcrumb.push({
    category,
    type,
    data,
    level,
    ...params
  })
}

/**
 * 自定义接口错误上报
 * @param data
 * @param cb
 * @returns
 */
export function apiCustomReport(data: any, cb?: (res: any) => boolean) {
  let needReport = false

  if (data && /^\{.*\}$/.test(data)) {
    const res = JSON.parse(data)
    // 支持自定义业务接口报错上报
    if (cb && res) {
      return cb(res) || (typeof res?.success === 'boolean' && !res.success)
    }
    // 响应有success字段，并且为false才需要上报
    if (res && typeof res?.success === 'boolean') {
      needReport = !res.success
    }
  }

  return needReport
}

/**
 * 获取业务接口错误码
 * @param data 业务接口响应数据
 * @param fields 错误码对应字段 ['code','errorCode']
 */
export function getErrorCode(data: any, fields: string[]) {
  if (data && /^\{.*\}$/.test(data)) {
    const res = JSON.parse(data)
    if (fields.length) {
      for (const field of fields) {
        if (res[field]) {
          return res[field]
        }
      }
    }
  }
  return undefined
}
