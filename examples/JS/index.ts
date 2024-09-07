import { initMonitorSDK } from '@ny/monitor-browser';

const instance = initMonitorSDK({
  debug: true,
  apiKey: '001',
  apiEnv: 'development',
  silentConsole: false,
  silentXhr: false,
  maxBreadcrumbs: 5,
  dsn: 'http://localhost:9999/tracking',
  serverTimeCheckDsn: 'http://localhost:9999/tracking/timeCheck',
  throttleDelayTime: 0,
  enableTraceId: false,
  uploadMode: 'sendBeacon', // sendBeacon、xhr、img
  isImmediateUpload: false,
  useCacheReport: true,
  useLocalCache: true,
  cacheReportLenLimit: 5,
  cacheReportTimeLimit: 5000,
  apiCustomReportField(data) {
    console.log('apiCustomReportField', data);
  },
  beforeDataReport(reportData) {
    return reportData;
  },
  configReportXhr(xhr) {
    xhr.setRequestHeader('mito-header', 'test123');
  }
});

window._MITO_ = instance;
