declare interface Window {
  // 微信交互方法
  wx: any;

  // 支付宝交互方法
  my: any;

  // 抖音交互方法
  tt: any;

  // 百度交互方法
  swan: any;

  App: any;

  WechatMiniprogram: any;

  getCurrentPages: () => void;

  // 快应用
  system: {
    // 获取当前环境
    getEnv: () => string;
    //
    postMessage: (type: string) => void;
  };
}

declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

declare type PickRequired<T, K extends keyof T> = Exclude<T, K> & Required<Pick<T, K>>;
