/**
 * @description 发版脚本
 */

import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { consola } from 'consola';
import color from 'picocolors';
import packages from '../meta/packages.json';
import { readJSONSync } from './utils';
import { publishMessage } from './publish-log';

function logCurrentVersion(cwd: string) {
  const pkgJson = path.join(cwd, 'package.json');

  const pkg = readJSONSync(pkgJson);
  return { pkgName: pkg.name, currentVersion: pkg.version };
}

function publishPackage(name: string) {
  const command = 'npm publish --access public';

  execSync(command, { stdio: 'inherit', cwd: `packages/${name}/dist` });
}

function buildPackage() {
  const command = 'npm run build';

  consola.success(`${color.bold('项目构建:')} ${color.green(command)}`);

  execSync(command, { stdio: 'inherit' });
}

function publish() {
  buildPackage();

  for (let i = 0; i < packages.length; i += 1) {
    let version = '';
    const { name } = packages[i];

    const { currentVersion, pkgName } = logCurrentVersion(`packages/${name}`);

    try {
      version = execSync(`npm view ${pkgName} version`).toString().trim();
    } catch (err) {
      //
    }

    if (version === currentVersion) continue;

    publishPackage(name);
  }

  publishMessage();
}

publish();
