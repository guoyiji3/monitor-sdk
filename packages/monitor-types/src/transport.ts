import { CategoryTypes } from '@ny/monitor-shared';
import { BreadcrumbPushData } from './breadcrumb';
import { DeviceInfo } from './wx';

/**
 * SDK版本信息、apiKey、trackerId
 *
 * @export
 * @interface AuthInfo
 */
export interface AuthInfo {
  apiKey?: string;
  apiEnv?: string;
  sdkVersion: string;
  sdkName: string;
  trackerId?: string;
  userId?: string;
}

export interface TransportDataType {
  authInfo?: AuthInfo;
  breadcrumb?: BreadcrumbPushData[];
  data?: ReportDataType;
  record?: any[];
  deviceInfo?: DeviceInfo;
  reportInfo?: any[];
}

export interface BaseTransformType {
  name?: string;
  pageUrl?: string;
  pageTitle?: string;
  timestamp?: number;
  category?: CategoryTypes;
  type?: string;
  subType?: string;
  level?: string;
  data?: any;
}

export interface ReportDataType extends Partial<BaseTransformType> {
  stack?: any;
  errorId?: number;
  // vue
  componentName?: string;
  propsData?: any;
  customTag?: string;
  message?: string;
}
