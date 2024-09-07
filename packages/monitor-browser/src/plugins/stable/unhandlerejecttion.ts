import { BrowserBreadcrumbTypes, BrowserPluginTypes, StableTypes, CategoryTypes } from '@ny/monitor-shared'
import { extractErrorStack, isError, on, Severity, unknownToString, _global } from '@ny/monitor-utils'
import { BasePluginType, HttpTransformedType, ReportDataType } from '@ny/monitor-types'
import { BrowserClient } from '../../browserClient'
import { addBreadcrumbInBrowser } from '../../utils'

/**
 * promise 插件
 */
const name = BrowserPluginTypes.UNHANDLEDREJECTION
const unhandlerejectionPlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name,
  monitor(notify) {
    on(_global, name, function (ev: PromiseRejectionEvent) {
      // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
      notify(name, ev)
    })
  },
  transform(collectedData: PromiseRejectionEvent) {
    let data: ReportDataType = {
      category: CategoryTypes.STABLE,
      type: StableTypes.PROMISE,
      subType: collectedData.type,
      level: Severity.Error,
      message: unknownToString(collectedData.reason)
    }
    if (isError(collectedData.reason)) {
      data = {
        ...data,
        ...extractErrorStack(collectedData.reason, Severity.Error)
      }
    }
    return data
  },
  consumer(transformedData: HttpTransformedType) {
    const breadcrumbStack = addBreadcrumbInBrowser.call(
      this,
      transformedData,
      transformedData.category,
      BrowserBreadcrumbTypes.UNHANDLEDREJECTION,
      Severity.Error
    )
    this.transport.send(transformedData, breadcrumbStack)
  }
}

export default unhandlerejectionPlugin
