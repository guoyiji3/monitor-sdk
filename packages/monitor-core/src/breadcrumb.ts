import { ToStringTypes } from '@ny/monitor-shared';
import { getTimestamp, silentConsoleScope, toStringValidateOption } from '@ny/monitor-utils';
import { BaseOptionsFieldsIntegrationType, BreadcrumbPushData } from '@ny/monitor-types';

/**
 * 用户行为栈
 * @export
 * @class Breadcrumb
 * @template O
 */
export class Breadcrumb<O extends BaseOptionsFieldsIntegrationType = BaseOptionsFieldsIntegrationType> {
  private maxBreadcrumbs = 5;

  private beforePushBreadcrumb: unknown = null;

  private stack: BreadcrumbPushData[] = [];

  constructor(options: Partial<O> = {}) {
    this.bindOptions(options);
  }

  /**
   * 添加用户行为栈
   * @param {BreadcrumbPushData} data
   * @memberof Breadcrumb
   */
  push(data: BreadcrumbPushData): BreadcrumbPushData[] {
    if (typeof this.beforePushBreadcrumb === 'function') {
      let result: BreadcrumbPushData | null = null;
      const { beforePushBreadcrumb } = this;
      silentConsoleScope(() => {
        result = beforePushBreadcrumb.call(this, this, data);
      });
      if (!result) return this.stack;
      return this.immediatePush(result);
    }
    return this.immediatePush(data);
  }

  /**
   * 设置入栈时间
   * @param data
   * @returns
   */
  private immediatePush(data: BreadcrumbPushData): BreadcrumbPushData[] {
    data.time || (data.time = getTimestamp());
    if (this.stack.length >= this.maxBreadcrumbs) {
      this.shift();
    }
    this.stack.push(data);
    // make sure xhr fetch is behind button click
    this.stack.sort((a: any, b: any) => a.time - b.time);
    // logger.log('BreadcrumbPushData', data)
    return this.stack;
  }

  private shift(): boolean {
    return this.stack.shift() !== undefined;
  }

  clear(): void {
    this.stack = [];
  }

  getStack(): BreadcrumbPushData[] {
    return this.stack;
  }

  bindOptions(options: Partial<O> = {}): void {
    const { maxBreadcrumbs = 0, beforePushBreadcrumb } = options;
    toStringValidateOption(maxBreadcrumbs, 'maxBreadcrumbs', ToStringTypes.Number) && (this.maxBreadcrumbs = maxBreadcrumbs);
    toStringValidateOption(beforePushBreadcrumb, 'beforePushBreadcrumb', ToStringTypes.Function) &&
      (this.beforePushBreadcrumb = beforePushBreadcrumb);
  }
}
