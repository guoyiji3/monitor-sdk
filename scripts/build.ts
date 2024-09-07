/**
 * @description 生成子包中 dist 文件夹
 */

import { execSync } from 'node:child_process';
import { consola } from 'consola';
import packages from '../meta/packages.json';
import { readJSONSync, writeJSONSync, copyFileSync } from './utils';

const root = `${process.cwd()}/packages`;

function buildMetaFiles() {
  for (let i = 0; i < packages.length; i += 1) {
    const { name } = packages[i];

    const packageJSON = readJSONSync(`${root}/${name}/package.json`);
    Object.keys(packageJSON.dependencies || {}).forEach((key) => {
      if (key.startsWith('@ny/monitor')) {
        const _name = key.replace(/^@ny\/?/, '');

        const _package = _name;

        const { version } = readJSONSync(`${root}/${_package}/package.json`);

        packageJSON.dependencies[key] = `^${version}`;
      }
    });

    const resultPath = `${root}/${name}/dist`;

    writeJSONSync(`${resultPath}/package.json`, packageJSON);

    copyFileSync(`${root}/${name}/README.md`, `${resultPath}/README.md`);
  }
}

function run() {
  consola.info('执行 clean 指令');
  execSync('npm run clean', { stdio: 'inherit' });

  consola.info('Rollup');
  execSync('npm run build:rollup', { stdio: 'inherit' });

  buildMetaFiles();
}

run();
