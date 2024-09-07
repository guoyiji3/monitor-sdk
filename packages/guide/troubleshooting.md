# 常见问题

## 支持 webpack 4

如果你使用的是 webpack 4 (Vue CLI 使用的是 webpack 4)，你可能会遇到这样的错误：

```sh
RROR  Failed to compile with ** errors

error  in ./node_modules/luban/**/dist/**.mjs

Can't import the named export '**' from non EcmaScript module (only default export is available)
```

这是构建文件为支持 Node.js 中的原生 ESM 模块进行的现代化适配。为更好地支持 Node，文件现在使用的扩展名是 .mjs 和 .js。

将下面的代码添加到你的配置文件中

::: code-group

```js [vue]
// vue.config.js
export default {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  }
};
```

```js [nuxt]
// nuxt.config.js
export default {
  build: {
    extend(config, { isClient }) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });
    }
  }
};
```

```js [webpack]
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
};
```

:::

## build.rollupOptions.external

当使用 UniApp Vue3/Vite 版启动时，你可能会遇到一个错误消息：

```sh
This is most likely unintended because it can break your application at runtime.
If you do want to externalize this module explicitly add it to
`build.rollupOptions.external`
```

这个错误是由于 @ny/luban 中引用了 @ny/luban-shared 底层模块，模块的导入路径在构建过程中没有被正确解析和处理，导致在运行时出现问题。

将下面的代码添加到你的配置文件中

```sh
pnpm add @rollup/plugin-node-resolve
```

```ts
// vite.config.ts
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [nodeResolve()]
});
```
