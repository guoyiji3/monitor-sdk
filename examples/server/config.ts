import { resolve } from 'path';

export const port = 2021;
const resolveDirname = (target: string) => resolve(__dirname, target);
const JsFilePath = resolveDirname('../JS');
const VueFilePath = resolveDirname('../Vue');
const ReactFilePath = resolveDirname('../React');
const Vue3FilePath = resolveDirname('../Vue3');
const WebPerformancePath = resolveDirname('../WebPerformance');
const browserDistFilePath = resolve('./packages/monitor-browser/dist');
const coreDistFilePath = resolve('./packages/monitor-core/dist');
const utilsDistFilePath = resolve('./packages/monitor-utils/dist');
const sharedDistFilePath = resolve('./packages/monitor-shared/dist');
const typesDistFilePath = resolve('./packages/monitor-types/dist');
// const vueDistFilePath = resolve('./packages/vue/dist')

export const FilePaths = {
  '/JS': JsFilePath,
  '/Vue': VueFilePath,
  '/React': ReactFilePath,
  '/Vue3': Vue3FilePath,
  '/WebPerformance': WebPerformancePath,
  '/browserDist': browserDistFilePath,
  '/coreDist': coreDistFilePath,
  '/utilsDist': utilsDistFilePath,
  '/sharedDist': sharedDistFilePath,
  '/typesDist': typesDistFilePath
  // '/vueDist': vueDistFilePath,
  // '/reactDist': reactDistFilePath,
};

export const ServerUrls = {
  normalGet: '/normal',
  exceptionGet: '/exception',
  normalPost: '/normal/post',
  exceptionPost: '/exception/post',
  errorsUpload: '/errors/upload'
};
