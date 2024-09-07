/**
 * @description 获取子项目的版本号
 */

import packages from '../meta/packages.json';
import { readJSONSync } from './utils';

export function getPageckageVersions() {
  const root = `${process.cwd()}/packages`;

  const versions: Record<string, string> = {};

  for (let i = 0; i < packages.length; i += 1) {
    const item = packages[i];

    const packageJSON = readJSONSync(`${root}/${item.name}/package.json`);

    versions[item.name] = packageJSON.version;
  }

  return versions;
}

export function getPageckageTexts() {
  const texts: Record<string, string> = {};

  for (let i = 0; i < packages.length; i += 1) {
    const item = packages[i];

    texts[item.name] = item.text || '';
  }

  return texts;
}
