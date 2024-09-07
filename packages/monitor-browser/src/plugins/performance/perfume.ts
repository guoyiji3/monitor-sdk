import { BrowserPluginTypes, CategoryTypes, PerformanceTypes } from '@ny/monitor-shared';
import { _global, numFixed, isContains, Severity, getTimestamp } from '@ny/monitor-utils';
import { BasePluginType } from '@ny/monitor-types';
import Perfume from 'perfume.js';
import { BrowserClient } from '../../browserClient';

export interface Options {
  enable: boolean;
  scriptTiming: boolean;
  xhrTiming: boolean;
}

export interface IPerfumeOptions {
  metricName: string;
  data: any;
  eventProperties: any;
  navigatorInformation: any;
  vitalsScore: string | null;
}

const MetricNameBucket = {};

const analyticsTool = {
  track: (type, metricName, data, notify) => {
    // console.log('metricName', metricName, data)
    const reportData = {
      type,
      subType: metricName,
      data
    };

    notify(CategoryTypes.PERFORMANCE, reportData);
  },
  collectGroup: (keys, notify) => {
    if (isContains(MetricNameBucket, keys)) {
      const data: any = {};
      keys.forEach((k) => {
        data[k] = numFixed(MetricNameBucket[k], 3);
        data.subType = k;
        delete MetricNameBucket[k];
      });
      const reportData = {
        data
      };
      notify(CategoryTypes.PERFORMANCE, reportData);
    }
  },
  collectResource: (type, initiatorType, data, notify) => {
    if (initiatorType === data.initiatorType) {
      const reportData = {
        type,
        subType: 'resourceTiming',
        data
      };
      notify(CategoryTypes.PERFORMANCE, reportData);
    }
  }
};

/**
 * https://github.com/Zizzamia/perfume.js/blob/master/README-zh_CN.md
 */
const perfumePlugin: BasePluginType<BrowserPluginTypes, BrowserClient> = {
  name: BrowserPluginTypes.PERFORMANCE,
  monitor(notify) {
    // 非浏览器终止监听
    if (!('document' in _global)) return;
    const { enable = true, xhrTiming = true, scriptTiming = true } = {};
    const isOpenResourceTiming = xhrTiming || scriptTiming || true;
    if (!enable) return;
    new Perfume({
      resourceTiming: isOpenResourceTiming,
      elementTiming: false, // 元素在屏幕上显示的时间
      analyticsTracker: (options: IPerfumeOptions) => {
        const { metricName, data } = options;
        MetricNameBucket[metricName] = data;

        // analyticsTool.collectGroup(['ttfb', 'fp', 'fcp'], notify)
        // analyticsTool.collectGroup(['fid', 'lcp', 'cls'], notify)

        switch (metricName) {
          case 'navigationTiming':
            if (data && data.timeToFirstByte) {
              analyticsTool.track(PerformanceTypes.PAGE, metricName, data, notify);
            }
            break;
          case 'networkInformation':
            if (data && data.effectiveType) {
              analyticsTool.track(PerformanceTypes.PAGE, metricName, data, notify);
            }
            break;
          case 'storageEstimate':
            // analyticsTool.track(metricName, data, notify)
            break;
          case 'resourceTiming':
            if (scriptTiming) {
              analyticsTool.collectResource(PerformanceTypes.RESOURCE, 'script', data, notify);
            }
            if (xhrTiming) {
              // 黑名单过滤
              const isBlock = this.transport.isSelfDsn(data.name) || this.options.isFilterHttpUrl(data.name);
              if (isBlock) return;
              analyticsTool.collectResource(PerformanceTypes.API, 'xmlhttprequest', data, notify);
            }
            break;
          case 'fp':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'fcp':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'ttfb':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'fid':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'lcp':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'cls':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { value: data }, notify);
            break;
          case 'clsFinal':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { value: data }, notify);
            break;
          case 'tbt':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          case 'elPageTitle':
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { duration: data }, notify);
            break;
          default:
            analyticsTool.track(PerformanceTypes.PAGE, metricName, { ...data }, notify);
            break;
        }
      }
    });
  },
  transform(collectedData: any) {
    collectedData.category = CategoryTypes.PERFORMANCE;
    collectedData.level = Severity.Low;
    collectedData.timestamp = getTimestamp();
    return collectedData;
  },
  consumer(transformedData: any) {
    this.transport.send(transformedData);
  }
};

export default perfumePlugin;
