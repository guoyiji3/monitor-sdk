import { StableTypes, CategoryTypes, HttpTypes } from '@ny/monitor-shared';
import { BaseTransformType } from './transport';

export interface HttpCollectedType extends BaseTransformType {
  request: {
    traceId?: string;
    method?: string;
    url?: string;
    data?: any;
    referer?: string;
    headers?: any;
    withCredentials?: boolean | string;
  };
  response: {
    status?: number;
    statusText?: string;
    timeout?: number;
    data?: any;
    message?: string;
    errorCode?: number | string | undefined;
  };
  spendTime?: number;
  startTime?: number;
  endTime?: number;
  category?: CategoryTypes.STABLE;
  type?: StableTypes.HTTP;
  subType?: string | HttpTypes;
  message?: string;
}

export interface HttpTransformedType extends HttpCollectedType {
  category: CategoryTypes.STABLE;
  type: StableTypes.HTTP;
  subType?: string | HttpTypes;
}
