import {
  silentConsoleScope,
  Severity,
  getTimestamp,
  variableTypeDetection,
  getBigVersion,
  getUrlWithEnv
} from '@ny/monitor-utils';
import { BaseBreadcrumbTypes, BaseEventTypes, CategoryTypes, StableTypes } from '@ny/monitor-shared';
import { BasePluginType, ReportDataType, ViewModel } from '@ny/monitor-types';
import { BaseClient } from '@ny/monitor-core';
import { vue2VmHandler, vue3VmHandler } from './helper';

/**
 * vue 插件
 */
const vuePlugin: BasePluginType<BaseEventTypes, BaseClient> = {
  name: BaseEventTypes.VUE,
  monitor(notify) {
    const Vue = this.options.vue;
    if (Vue && Vue.config) {
      const originErrorHandle = Vue.config.errorHandler;
      Vue.config.errorHandler = (err: Error, vm: ViewModel, info: string): void => {
        const data: ReportDataType = {
          category: CategoryTypes.STABLE,
          type: StableTypes.VUE,
          subType: err.name,
          message: `${err.message}(${info})`,
          level: Severity.Error,
          pageUrl: getUrlWithEnv(),
          stack: err.stack || [],
          timestamp: getTimestamp()
        };
        notify(BaseEventTypes.VUE, { data, vm });
        const hasConsole = typeof console !== 'undefined';
        // vue源码会判断Vue.config.silent，为true时则不会在控制台打印，false时则会打印
        if (hasConsole && !Vue.config?.silent) {
          silentConsoleScope(() => {
            console.error(`Error in ${info}: "${err.toString()}"`, vm);
            console.error(err);
          });
        }
        return originErrorHandle?.(err, vm, info);
      };
    }
  },
  transform({ data: collectedData, vm }: { data: ReportDataType; vm: ViewModel }) {
    const Vue = this.options.vue;
    if (variableTypeDetection.isString(Vue?.version)) {
      switch (getBigVersion(Vue?.version as string)) {
        case 2:
          return { ...collectedData, ...vue2VmHandler(vm) };
        case 3:
          return { ...collectedData, ...vue3VmHandler(vm) };
        default:
          return collectedData;
      }
    }
    return {};
  },
  consumer(data: ReportDataType) {
    const breadcrumbStack = this.breadcrumb.push({
      category: CategoryTypes.STABLE,
      type: BaseBreadcrumbTypes.VUE,
      data,
      level: Severity.Error
    });
    this.transport.send(data, breadcrumbStack);
  }
};
export default vuePlugin;
