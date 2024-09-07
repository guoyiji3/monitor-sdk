import * as fs from 'node:fs';

// 删除文件
export function clearFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;

  try {
    fs.unlinkSync(filePath);

    console.log(`文件"${filePath}"已经删除`);
  } catch (err) {
    console.error(`文件"${filePath}" 删除失败:`, err);
  }
}

export function readJSONSync<T = any>(cwd: string): T {
  const data = fs.readFileSync(cwd, 'utf8');

  return JSON.parse(data);
}

export function writeJSONSync(cwd: string, data: unknown): void {
  fs.writeFileSync(cwd, JSON.stringify(data, null, 2));
}

export function copyFileSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;

  fs.copyFileSync(src, dest);
}

export function parseCommandLine(): Record<string, string> {
  const args = process.argv.slice(2);

  const list: string[][] = [];

  args.forEach((v) => v.startsWith('--') && list.push(v.slice(2).split('=')));

  return Object.fromEntries(list);
}
