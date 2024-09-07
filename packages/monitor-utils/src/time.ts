/**
 * 定时检查本地时间，出现异常才会重新校准
 */
export const checkLocalTimeForInterval = (options?: { defaultInterval: number; mixTimeDiff: number }, cb?: () => void) => {
  let beginTime;
  let timerId;
  let flush = true; // a lock. for prevent timer loops during init Timer.
  const defaultInterval = options?.defaultInterval || 30000; // check time difference.default: 30s.
  const mixTimeDiff = options?.mixTimeDiff || 10000; // local time mix differece is 10s.

  function initTime() {
    flush = false;
    if (timerId) {
      clearTimeout(timerId);
    }
    beginTime = new Date().getTime();
    beginTimer();
  }

  function beginTimer() {
    const currentTime = new Date().getTime();

    if (flush && Math.abs(currentTime - beginTime) > defaultInterval + mixTimeDiff) {
      // check serverTime.
      console.log('local time is change! Recheck the server time.');
      cb && cb();
    }

    beginTime = currentTime; // reset begin time.

    if (timerId) {
      clearTimeout(timerId); // clear previous.
    }

    flush = true; // release lock.

    timerId = setTimeout(function () {
      if (flush) {
        beginTimer();
      }
    }, defaultInterval);
  }

  // 初始化
  initTime();
};

export const httpGet = (url: string, successCb?: (data: any) => void, failCb?: (data: any) => void) => {
  // 第一步： 创建xhr对象
  const xhr = new XMLHttpRequest();
  // 第二步： 调用open函数 指定请求方式 与URL地址
  xhr.open('GET', url, true);
  // 第三步： 调用send函数 发起ajax请求
  xhr.send();
  // 第四步： 监听onreadystatechange事件
  xhr.onreadystatechange = function () {
    // 监听xhr对象的请求状态 与服务器的响应状态
    if (this.readyState === 4) {
      if (this.status === 200 || (this.status > 200 && this.status < 300)) {
        successCb && successCb(xhr.responseText);
      } else {
        failCb && failCb(xhr.responseText);
      }
    }
  };
};

/**
 * 获取校准后时间
 */
export const getCheckTime = () => {
  return new Date().getTime() - Number(sessionStorage.getItem('monitor_timeDiff') || 0);
};

/**
 * 执行时间校准
 */
export const runTimeCheck = (opts: any, successCb?: () => void, failCb?: () => void) => {
  const startTime = new Date().getTime();
  httpGet(
    opts?.serverTimeCheckDsn,
    (data: any) => {
      if (data) {
        const endTime = new Date().getTime();
        const spendTime = endTime - startTime;
        const { serverTime } = JSON.parse(data);
        const timeDiff = endTime - Math.floor(spendTime / 2) - serverTime;
        if (opts?.debug) {
          console.log('server time', serverTime);
          console.log('client time', endTime);
          console.log('spend time', spendTime);
          console.log('time diff', timeDiff);
        }

        sessionStorage.setItem('monitor_timeDiff', timeDiff.toString());
        successCb && successCb();
      }
    },
    () => {
      failCb && failCb();
    }
  );
};
