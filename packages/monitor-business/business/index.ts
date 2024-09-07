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
