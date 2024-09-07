/**
 * @description 生成 VitePress 侧边栏数据 packages/metadata.json
 */

import fs from 'node:fs';
import path from 'node:path';
import type { SidebarItems, SidebarItem } from '../typings/packages';
import matter from 'gray-matter';
import packages from '../meta/packages.json';
import { clearFile, writeJSONSync } from './utils';

const root = `${process.cwd()}/packages`;
// 数据目录
const mPath = `${root}/metadata.json`;

const exclude = ['node_modules', 'README.md', '__tests__'];

clearFile(mPath);

const metadata: Record<string, SidebarItems[]> = {};

function traverseFolder(packageName: string, folderPath: string, folderName: string) {
  const files = fs.readdirSync(`${root}/${folderPath}`);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];

    if (exclude.includes(file)) continue;

    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(`${root}/${filePath}`);

    if (stats.isDirectory()) {
      // 如果是文件夹，递归遍历子文件夹
      traverseFolder(packageName, filePath, file);
    } else if (stats.isFile() && file.endsWith('.md')) {
      // 如果是Markdown文件，执行输出操作
      const name = file === 'index.md' ? folderName : path.parse(file).name;

      const mdRaw = fs.readFileSync(`${root}/${filePath}`, 'utf-8');
      const { data: frontmatter } = matter(mdRaw);
      const { category, text = name, order } = frontmatter;

      const data = { name, text, link: path.join('/', filePath), order };

      if (category) {
        const index = metadata[packageName].findIndex((f) => f.category === category);

        index !== -1 && metadata[packageName][index].items?.push(data);
      } else {
        metadata[packageName].push(data);
      }
    }
  }
}

function sortCustomSidebar(a: SidebarItem, b: SidebarItem) {
  return (b.order || 9999) - (a.order || 9999);
}

for (let i = 0; i < packages.length; i += 1) {
  const item = packages[i];

  const started: SidebarItems = { text: '入门', category: 'started', items: [] };

  started.items?.push({ link: `/${item.name}/README.md`, text: '概述', name: '概述', order: Infinity });

  metadata[item.name] = [started, ...(item.functions || [])];

  traverseFolder(item.name, item.name, '');

  // 存在 二级 子目录
  if (item.functions?.length) {
    for (let j = 0; j < metadata[item.name].length; j += 1) {
      metadata[item.name][j].items?.sort(sortCustomSidebar);

      metadata[item.name][j].items?.forEach((v) => delete v.order);
    }
  }
}

writeJSONSync(mPath, metadata);
