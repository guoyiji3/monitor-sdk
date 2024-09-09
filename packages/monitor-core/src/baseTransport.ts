import {
  logger,
  Queue,
  generateUUID,
  createErrorId,
  isEmpty,
  validateOptionsAndSet,
  addCache,
  getCache,
  clearCache
} from '@ny/monitor-utils';
import { SDK_NAME, SDK_VERSION, ToStringTypes } from '@ny/monitor-shared';
import {
  AuthInfo,
  BaseOptionsFieldsIntegrationType,
  BreadcrumbPushData,
  ReportDataType,
  TransportDataType
} from '@ny/monitor-types';

/**
 * 公共上报服务
 * @export
 * @abstract
 * @class BaseTransport
 * @template O
 */
export abstract class BaseTransport<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> {
  apiKey = '';

  apiEnv = '';

  userId = '';

  dsn = '';

  projectName = '';

  cid = '';

  serverTimeCheckDsn = '';

  queue: Queue;

  beforeDataReport:
    | Promise<TransportDataType | null | undefined | boolean>
    | TransportDataType
    | any
    | null
    | undefined
    | boolean = null;

  backTrackerId: unknown = null;

  configReportUrl: unknown = null;

  maxDuplicateCount = 2;

  isImmediateUpload = true;

  useCacheReport = true;

  useLocalCache = true;

  cacheReportLenLimit = 5;

  cacheReportTimeLimit = 3000;

  timer;

  alreadyChangeTransportData;

  sampleRate = 1;

  constructor() {
    this.queue = new Queue();
  }

  /**
   * 获取当前SDK信息
   * @return {*}  {AuthInfo}
   * @memberof BaseTransport
   */
  getAuthInfo(): AuthInfo {
    const trackerId = this.getTrackerId();
    const result: AuthInfo = {
      trackerId: String(trackerId),
      sdkVersion: SDK_VERSION,
      sdkName: SDK_NAME,
      apiKey: this.apiKey,
      apiEnv: this.apiEnv,
      userId: this.userId || this.getLocalUserId()
    };
    return result;
  }

  // 本地生成userId
  // eslint-disable-next-line class-methods-use-this
  getLocalUserId(): string {
    let userId = window.localStorage.getItem('fed-monitor-userId');
    if (!userId) {
      userId = generateUUID().split('-').join('');
      window.localStorage.setItem('fed-monitor-userId', userId);
    }
    return userId;
  }

  /**
   * 获取hooks中返回的trackId，没有就返回''
   * @return {*}  {(string | number)}
   * @memberof BaseTransport
   */
  getTrackerId(): string | number {
    if (typeof this.backTrackerId === 'function') {
      const trackerId = this.backTrackerId();
      if (typeof trackerId === 'string' || typeof trackerId === 'number') {
        return trackerId;
      }
      logger.error(`trackerId:${trackerId} 期望 string 或 number 类型，但是传入 ${typeof trackerId}`);
    }
    return '';
  }

  /**
   * 判断当前url是不是你配置的dsn
   * @param {string} targetUrl
   * @return {*}  {boolean}
   * @memberof BaseTransport
   */
  isSelfDsn(targetUrl: string): boolean {
    return this.dsn === targetUrl;
  }

  /**
   * 服务端时间校准地址
   * @param targetUrl
   * @returns
   */
  isSelfSeverTimeCheckDsn(targetUrl: string): boolean {
    return this.serverTimeCheckDsn === targetUrl;
  }

  /**
   * 绑定配置项
   * @param {Partial<O>} [options={}]
   * @memberof BaseTransport
   */
  bindOptions(options: Partial<O> = {}): void {
    const {
      dsn,
      beforeDataReport,
      apiKey,
      apiEnv,
      maxDuplicateCount,
      backTrackerId,
      configReportUrl,
      isImmediateUpload,
      userId,
      useCacheReport,
      useLocalCache,
      cacheReportLenLimit,
      cacheReportTimeLimit,
      sampleRate,
      serverTimeCheckDsn,
      projectName,
      cid
    } = options;
    const optionArr: [any, string, ToStringTypes][] = [
      [apiKey, 'apiKey', ToStringTypes.String],
      [apiEnv, 'apiEnv', ToStringTypes.String],
      [userId, 'userId', ToStringTypes.String],
      [dsn, 'dsn', ToStringTypes.String],
      [cid, 'cid', ToStringTypes.String],
      [projectName, 'projectName', ToStringTypes.String],
      [serverTimeCheckDsn, 'serverTimeCheckDsn', ToStringTypes.String],
      [maxDuplicateCount, 'maxDuplicateCount', ToStringTypes.Number],
      [beforeDataReport, 'beforeDataReport', ToStringTypes.Function],
      [backTrackerId, 'backTrackerId', ToStringTypes.Function],
      [configReportUrl, 'configReportUrl', ToStringTypes.Function],
      [isImmediateUpload, 'isImmediateUpload', ToStringTypes.Boolean],
      [useCacheReport, 'useCacheReport', ToStringTypes.Boolean],
      [useLocalCache, 'useLocalCache', ToStringTypes.Boolean],
      [cacheReportLenLimit, 'cacheReportLenLimit', ToStringTypes.Number],
      [cacheReportTimeLimit, 'cacheReportTimeLimit', ToStringTypes.Number],
      [sampleRate, 'sampleRate', ToStringTypes.Number]
    ];
    validateOptionsAndSet.call(this, optionArr);
  }

  /**
   * 发送数据到服务端
   * @param {*} data
   * @param {BreadcrumbPushData[]} breadcrumb
   * @return {*}
   * @memberof BaseTransport
   */
  async send(data: any, breadcrumb: BreadcrumbPushData[] = []): Promise<void> {
    const finalData: any = { ...this.getTransportData(data) };

    // 小于采样率数据不上报
    if (this.sampleRate < Math.random() && !data.isTrack) {
      if (this.useCacheReport) {
        clearCache(this.useLocalCache);
      }
      return;
    }

    // 如果是埋点则不需要生成errorId
    if (!data.isTrack) {
      const errorId = createErrorId(finalData, this.apiKey, this.maxDuplicateCount);
      if (!errorId) return;
      finalData.data.errorId = errorId;
    }

    // 上报接口为必填
    let dsn = this.dsn || 'https://logcollect.91160.com/v2/dev/web?type=performance';
    if (isEmpty(dsn)) {
      logger.error('dsn is empty, pass in when initializing please');
      return;
    }

    // 可使用缓存的数据
    const canCacheData = {
      ...finalData,
      breadcrumb
    };

    // 开启缓存上报
    if (this.useCacheReport) {
      // 将数据放入缓存
      addCache(canCacheData, this.useLocalCache);
    }

    // 生成最终上报数据
    let transportData = this.getFinalTransportData(canCacheData);

    // 修改上报地址
    if (typeof this.configReportUrl === 'function') {
      dsn = this.configReportUrl(transportData, dsn);
      if (!dsn) return;
    }

    // 数据上报前钩子, 为false时不上报
    if (typeof this.beforeDataReport === 'function') {
      transportData = await this.beforeDataReport(transportData);
      if (!transportData) {
        if (this.useCacheReport) {
          clearCache(this.useLocalCache);
        }
        return;
      }
      this.alreadyChangeTransportData = transportData;
    }

    // 开启缓存上报
    if (this.useCacheReport) {
      const cacheData = getCache(this.useLocalCache);

      // 缓存条数上限
      if (this.cacheReportLenLimit && Object.keys(cacheData).length === this.cacheReportLenLimit) {
        logger.log('upload by cacheReportLenLimit', transportData);
        // 防止重复上报
        this.timer && clearTimeout(this.timer);
        this.sendToServer(transportData, dsn);
        clearCache(this.useLocalCache);
        return;
      }

      // 定时上限
      if (Object.keys(cacheData).length && this.cacheReportTimeLimit) {
        this.timer && clearTimeout(this.timer);
        const { useLocalCache } = this;
        this.timer = setTimeout(() => {
          logger.log('upload by cacheReportTimeLimit', transportData);
          this.sendToServer(transportData, dsn);
          clearCache(useLocalCache);
        }, this.cacheReportTimeLimit);
        return;
      }

      if (this.cacheReportLenLimit || this.cacheReportTimeLimit) {
        return;
      }
    }

    // 立即上报
    if (this.isImmediateUpload) {
      logger.log('upload by immediately');
      return this.sendToServer(transportData, dsn);
    }
    // 浏览器空闲上报
    if (window.requestIdleCallback) {
      window.requestIdleCallback(
        () => {
          logger.log('upload by requestIdleCallback');
          return this.sendToServer(transportData, dsn);
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        logger.log('upload by setTimeout');
        return this.sendToServer(transportData, dsn);
      });
    }
  }

  /**
   * 获取最终上报数据
   * @param canCacheData
   * @returns
   */
  getFinalTransportData(canCacheData) {
    // 上报数据格式
    const transportData = {
      reportInfo: this.useCacheReport ? getCache(this.useLocalCache) : [canCacheData],
      authInfo: this.getAuthInfo()
    };

    return transportData;
  }

  /**
   * 直接上报缓存数据
   * @param transportData
   * @returns
   */
  reportDataByImmediate() {
    const cacheData = getCache(this.useLocalCache);
    if (!Object.keys(cacheData).length) {
      return;
    }

    // 上报接口为必填
    let dsn = this.dsn || 'https://logcollect.91160.com/v2/dev/web?type=performance';
    if (isEmpty(dsn)) {
      logger.error('dsn is empty,pass in when initializing please');
      return;
    }

    // 获取上报数据
    const transportData = this.alreadyChangeTransportData || this.getFinalTransportData('');

    // 上报地址
    if (typeof this.configReportUrl === 'function') {
      dsn = this.configReportUrl(transportData, dsn);
      if (!dsn) return;
    }

    // 上报
    if (this.useCacheReport) {
      logger.log('reportDataByImmediate', transportData);
      this.sendToServer(transportData, dsn);
      clearCache(this.useLocalCache);
    }
  }

  /**
   * post方式，子类需要重写
   * @abstract
   * @param {(TransportDataType | any)} data
   * @param {string} url
   * @memberof BaseTransport
   */
  abstract post(data: TransportDataType | any, url: string): void;

  /**
   * 最终上报到服务器的方法，需要子类重写
   * @abstract
   * @param {(TransportDataType | any)} data
   * @param {string} url
   * @memberof BaseTransport
   */
  abstract sendToServer(data: TransportDataType | any, url: string): void;

  /**
   * 获取上报的格式
   * @abstract
   * @param {ReportDataType} data
   * @return {TransportDataType}  {TransportDataType}
   * @memberof BaseTransport
   */
  abstract getTransportData(data: ReportDataType): TransportDataType;
}
