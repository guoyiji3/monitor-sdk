/**
 * @description 生成子包中的导出文件（index.ts）
 */

import * as fs from 'node:fs';
import * as os from 'os';
import packages from '../meta/packages.json';
import { clearFile } from './utils';

const root = `${process.cwd()}/packages`;

function updateImport() {
  for (let i = 0; i < packages.length; i += 1) {
    const item = packages[i];

    if (item.manualImport) continue;
    // 获取项目目录
    const path = `${root}/${item.name}`;

    clearFile(`${path}/index.ts`);

    const folder = fs.readdirSync(path);

    const mesm = fs.createWriteStream(`${path}/index.ts`);
    // 忽略空文件
    const imports = folder.filter((name) => fs.existsSync(`${path}/${name}/index.ts`));
    // 写入到处函数
    imports.forEach((name) => mesm.write(`export * from './${name}';${os.EOL}`));

    mesm.end();
  }
}

async function run() {
  await Promise.all([updateImport()]);
}

run();
