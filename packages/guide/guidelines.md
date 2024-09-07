# 新建项目

使用 `pnpm run new` 根据命令窗口提示，完成项目创建

## 项目文件

将会自动生成以下两个文件：

```bash
packages/installation/[新项目名称].md      # 项目的介绍和使用文档文件
packages/[新项目名称]/package.json         # 项目的描述文件
```

## 入口文件

通过运行 `pnpm run dev` 命令，将会生成 `packages/[新项目名称]/index.ts` 入口文件。如果你不希望生成 **index.ts** 文件，你可以在 `meta/packages.json` 文件中将该项目的 `manualImport` 属性设置为 `true`，这样在启动时将会忽略生成 **index.ts** 文件。

::: warning
请注意，你也不需要更新包的 packages/[新项目名称]/index.ts，因为它们是自动生成的。
:::

## 程序包清单

`meta/packages.json` 用于描述子项目的基本信息和配置列表

```ts
interface Packages {
  // 项目的名称
  name: string;
  // 项目简短说明，导航栏
  text: string;
  // 项目详细描述，package.json description 内容
  description: string;
  // **/index.ts 入口文件是否需要手动导入
  manualImport?: boolean;
  // 项目是否提供文档
  documentation?: boolean;
  // 功能类别列表 - 侧边栏配置
  functions?: SidebarItems;
}

interface SidebarItems {
  // 一级目录 - 标题
  text: string;
  // 分类 - 标识符
  category?: string;
  // 一级目录 - 链接
  link?: string;
  // 二级目录
  items?: {
    // 二级目录 - 功能函数名称
    name: string;
    // 二级目录 - 标题
    text: string;
    // 二级目录 - 链接
    link: string;
  }[];
}
```

## 命令行界面

```sh
{
  "scripts": {
    # 运行测试用例
    "test": "vitest run",
    # 运行测试用例，并输出覆盖率报告
    "test:cov": "vitest run --coverage",
    # 创建新函数模版
    "new": "esno scripts/template",
    # 创建新项目模版
    "package": "esno scripts/template --type=package",
    # 本地启动 vitepress
    "dev": "npm run update && vitepress dev packages",
    # vitepress 构建
    "build:docs": "npm run update && vitepress build packages",
    # 构建项目
    "build": "npm run update && esno scripts/build",
    # git 提交时写出规范的提交 message 的
    "commit": "cz",
    # vitepress 本地预览构建产物
    "docs:preview": "vitepress preview packages",
    # 更新版本号
    "release": "esno scripts/release"
    # 发布到 nynpm 仓库
    "publish:ci": "esno scripts/publish",
  }
}
```
