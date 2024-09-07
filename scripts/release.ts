/**
 * @description 更新版本号脚本
 */

import * as path from 'node:path';
import { execSync } from 'node:child_process';
import color from 'picocolors';
import { consola } from 'consola';
import inquirer from 'inquirer';
import Git from 'simple-git';
import packages from '../meta/packages.json';
import { readJSONSync, writeJSONSync } from './utils';

const rootPath = process.cwd();

const git = Git({ maxConcurrentProcesses: 200 });

function logCurrentVersion(name: string) {
  const cwd = `packages/${name}`;

  const pkgJson = path.join(cwd, 'package.json');

  const pkg = readJSONSync(pkgJson);

  return { pkgName: pkg.name, currentVersion: pkg.version };
}

function updateVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  // 解析版本号
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);

  if (type === 'major') return `${major + 1}.0.0`;

  if (type === 'minor') return `${major}.${minor + 1}.0`;

  if (type === 'patch') return `${major}.${minor}.${patch + 1}`;

  return version;
}

async function updateCheck(name: string) {
  const commands = ['log', '-n 1', '--pretty=format:%H'];
  const filePath = `${rootPath}/packages/${name}`;
  // 最新提交 commit id
  const latestCommitId = await git.raw([...commands, filePath]);
  // 上一次发版 commit id
  const lastReleaseCommitId = await git.raw([...commands, '--grep=^release', filePath]);
  // 不需要发版
  if (latestCommitId === lastReleaseCommitId) return { state: false, name };

  try {
    const { currentVersion, pkgName } = logCurrentVersion(name);

    const version = execSync(`npm view ${pkgName} version`).toString().trim();
    // 版本不一样
    if (currentVersion !== version) return { state: false, name };
  } catch (err) {
    // 没有发过版本
    return { state: false, name };
  }

  return { state: true, name };
}

async function getPackageNamge() {
  const updates = packages.map((item) => updateCheck(item.name));

  const choices = (await Promise.all(updates)).filter((item) => item.state).map((item) => item.name);

  if (choices.length === 0) {
    consola.warn('目前尚未找到需要进行版本发布的项目，请在提交更新的代码后再进行版本发布');

    process.exit(0);
  }

  const { name } = await inquirer.prompt([
    {
      type: 'list',
      name: 'name',
      message: '要发布的项目:',
      choices: choices.map((word) => word.charAt(0).toUpperCase() + word.slice(1)),
      filter: (v) => v.charAt(0).toLowerCase() + v.slice(1)
    }
  ]);
  return name;
}

async function getNewVersion(version: string) {
  const { type } = await inquirer.prompt({
    type: 'list',
    name: 'type',
    message: '要发布的版本:',
    choices: [
      { value: 'major', name: `主版本 (${version} -> ${updateVersion(version, 'major')})` },
      { value: 'minor', name: `次要版本 (${version} -> ${updateVersion(version, 'minor')})` },
      { value: 'patch', name: `补丁版本 (${version} -> ${updateVersion(version, 'patch')})` }
    ]
  });

  return updateVersion(version, type);
}

function setPkgVersion(version: string, name: string) {
  const cwd = `packages/${name}`;

  const pkgJson = path.join(cwd, 'package.json');
  const pkg = readJSONSync(pkgJson);
  pkg.version = version;
  writeJSONSync(pkgJson, pkg);
}

function commitChanges(name: string, version: string) {
  const message = `release: @ny/${name} v${version}`;
  execSync(`git add ./packages/${name}/package.json && git commit -m "${message}"`, { stdio: 'inherit' });
}

async function release() {
  const name = await getPackageNamge();

  const { currentVersion, pkgName } = logCurrentVersion(name);

  consola.success(`${color.bold('当前项目:')} ${color.green(pkgName)}`);
  consola.success(`${color.bold('当前项目版本:')} ${color.green(currentVersion)}`);

  const version = await getNewVersion(currentVersion);

  setPkgVersion(version, name);

  commitChanges(name, version);
}

release();
