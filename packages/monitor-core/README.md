# 背景

在实际项目开发中，不论是针对 B 端还是 C 端，通常都需要维护一个名为 utils（或者其他类似名称，如 tools 等）的文件目录，用于管理项目中常用的工具方法。这些工具方法包括但不限于时间处理、缓存管理、URL 参数解析、脚本加载等。这些方法可能存在于多个项目中，造成了冗余和工具方法规范不一致的问题。

另外我们常常使用开源工具库（如 lodash 等），以便快速、方便地进行项目开发。当 npm 上没有符合自身业务需求的工具库时，我们不得不自己动手创建属于自己的工具库。

## 概述

`@ny/luban` 是一个封装了业务常用方法的核心库。包含了业务的核心逻辑和功能，提供了可重用的工具和方法，旨在简化开发流程，提高代码的可维护性，并确保应用程序的一致性和质量。

## 安装

::: code-group

```bash [npm]
npm i @ny/luban
```

```bash [yarn]
yarn add @ny/luban
```

```bash [pnpm]
pnpm add @ny/luban
```

:::

## 使用示例

```ts
import { isNumber, isString } from '@ny/luban';

isNumber(1); // -> true

isString(12); // -> false
```
