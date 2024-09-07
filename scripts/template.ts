/**
 * @description 生成模板脚本
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Packages } from '../typings/packages';
import inquirer from 'inquirer';
import Git from 'simple-git';
import packages from '../meta/packages.json';
import { parseCommandLine, readJSONSync, writeJSONSync } from './utils';

const root = path.join(process.cwd(), 'packages');
const git = Git({ maxConcurrentProcesses: 200 });

function createFile(file: string, content: string) {
  fs.writeFileSync(file, content);
}

function createDirectory(cwd: string, recursive = true) {
  if (recursive) {
    fs.mkdirSync(cwd, { recursive: true });
  } else {
    fs.mkdirSync(cwd);
  }
}

function createFunctionTemplate(name: string, description: string) {
  const content = `/**
 * ${description}
 *
 */
export function ${name}(name: string): void {
  //
}
`;

  return content;
}

function createDocumentTemplate(name: string, description: string, category: string) {
  let content = category
    ? `---
category: ${category}
---

`
    : '';

  content += `# ${name}(name)

${description}

## 参数

\`name (string)\`: 指定要描述参数的名称

## 返回值

\`(undefined)\`: 无

## 例子

\`\`\`ts
${name}(name)
// =>
\`\`\`
`;

  return content;
}

function createTestTemplate(name: string) {
  const content = `import { describe, expect, it } from 'vitest';
import { ${name} } from '..';

describe('${name}', () => {
  it('描述文案', () => {
    expect(${name}('')).toBe(undefined);
  });
});
`;

  return content;
}

async function createPackageJson(name: string, description: string) {
  const authors = await Promise.all([git.raw(['config', 'user.name']), git.raw(['config', 'user.email'])]);

  return {
    name: `@ny/${name}`,
    description,
    version: '1.0.0',
    author: { name: authors[0].replace('\n', ''), email: authors[1].replace('\n', '') },
    publishConfig: { registry: 'https://nynpm.91160.com/' },
    main: './index.cjs.js',
    module: './index.esm.mjs',
    types: './index.d.ts',
    exports: {
      '.': {
        types: './index.d.ts',
        import: './index.esm.mjs',
        require: './index.cjs.js'
      }
    }
  };
}

function nameValidate(paths: string[]) {
  return (value: string) => {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return '名称只能含有字母';
    }

    if (!/^[a-z]/.test(value)) {
      return '名称首字母必须小写';
    }

    if (fs.existsSync(path.join(...paths, value))) {
      return `${value}方法已经存在`;
    }

    return true;
  };
}

async function createFunction() {
  const choices = packages.filter(({ manualImport }) => !manualImport);

  const { collect } = await inquirer.prompt([
    {
      type: 'list',
      name: 'collect',
      message: '项目分类:',
      choices: choices.map(({ name }) => name),
      filter: (v) => v.charAt(0).toLowerCase() + v.slice(1)
    }
  ]);

  const functions = packages.find((p) => p.name === collect)?.functions || [];

  const { name, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '方法名称:',
      validate: nameValidate([root, collect])
    },
    {
      type: 'input',
      name: 'description',
      message: '方法描述:'
    }
  ]);

  let category = '';

  if (functions.length) {
    const frontmatter = await inquirer.prompt([
      {
        type: 'list',
        name: 'category',
        message: '方法分类:',
        choices: functions.map((f) => `${f.text} - ${f.category}`),
        filter: (value) => value.split(' - ')[1]
      }
    ]);

    category = frontmatter.category;
  }

  const cwd = path.join(root, collect, name);

  // 创建目录
  createDirectory(cwd);
  createDirectory(path.join(cwd, '__tests__'));

  const templateContent = createFunctionTemplate(name, description);
  createFile(path.join(cwd, 'index.ts'), templateContent);

  const documentContent = createDocumentTemplate(name, description, category);
  createFile(path.join(cwd, 'index.md'), documentContent);

  const testContent = createTestTemplate(name);
  createFile(path.join(cwd, '__tests__', 'index.spec.ts'), testContent);
}

async function createPackage() {
  const {
    title,
    description,
    text,
    manualImport = false,
    documentation = true
  } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: '项目名称:',
      validate: nameValidate([root])
    },
    {
      type: 'confirm',
      name: 'manualImport',
      message: '入口文件是否需要手动导入:',
      default: false
    },
    {
      type: 'confirm',
      name: 'documentation',
      message: '项目是否提供文档:',
      default: true
    },
    {
      type: 'input',
      name: 'text',
      message: '简短说明:'
    },
    {
      type: 'input',
      name: 'description',
      message: '详细描述:'
    }
  ]);

  const name = `luban-${title}`;

  const pkg = await createPackageJson(name, description);

  const sources = readJSONSync<Packages[]>('meta/packages.json');
  sources.push({ name, text, description, manualImport, documentation });

  const packageDir = path.join(root, name);
  // 创建包目录
  createDirectory(packageDir);
  createFile(path.join(root, name, 'README.md'), '');

  writeJSONSync(path.join(packageDir, 'package.json'), pkg);

  writeJSONSync('meta/packages.json', sources);
}

const { type = 'function' } = parseCommandLine();

if (type === 'function') {
  createFunction();
} else if (type === 'package') {
  createPackage();
}
