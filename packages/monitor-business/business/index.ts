import { getSystemInfo } from '@ny/monitor-utils';
// 业务层处理

/**
 * 优先自定义传入再到统一业务封装层
 * @param data
 */
export function businessInterfaceReport(data: string) {
  // isBusinessError
  // go状态码：error_code === ‘200’
  // Java状态码：code === 1
  let isBusinessError = false;
  if (data && /^\{.*\}$/.test(data)) {
    const res = JSON.parse(data);
    const { error_code: errorCode, code, status } = res || {};
    isBusinessError = ![200].includes(errorCode) || ![1, 200].includes(code) || ![1, 200].includes(status);
  }
  return isBusinessError;
}

// 获取业务错误码
export function getBusinessErrorCode(data: string, errorCodeArr = ['error_code', 'code', 'status']) {
  if (data && /^\{.*\}$/.test(data)) {
    const res = JSON.parse(data);
    if (errorCodeArr.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const field of errorCodeArr) {
        if (res[field]) {
          return res[field];
        }
      }
    }
  }
  return undefined;
}

/**
 * 获取最终上报数据
 * @param canCacheData
 * @returns
 */
export function getTransportDataNew(data, { uploadMode, projectName, cid }) {
  console.log('getTransportDataNew-------------------->');
  const { authInfo, reportInfo } = data;
  const { Platform, OsVersion } = getSystemInfo();
  const { apiEnv, userId } = authInfo;
  const report_list = reportInfo.map((item) => {
    const { pageUrl, timestamp, level } = item?.data || {};
    return {
      index: 'performance',
      cat_event_name: 'fedmonitorsdk',
      ext: JSON.stringify(item),
      bhv_time: timestamp,
      cat_domain: projectName,
      cat_event_type: uploadMode,
      channel_id: cid,
      current_url: pageUrl,
      env: apiEnv,
      log_level: level,
      os_version: OsVersion,
      platform: Platform,
      request_type: 1,
      user_id: userId
    };
  });
  return report_list;
}
