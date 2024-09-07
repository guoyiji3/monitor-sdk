import { resolve } from 'node:path';
import type { UserConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import postcssNested from 'postcss-nested';
import { getContributors } from '../scripts/changelog';
import { getPageckageVersions, getPageckageTexts } from '../scripts/packages';
import { MarkdownTransform } from './.vitepress/plugins/markdownTransform';
import { Contributors } from './.vitepress/plugins/contributors';
import { Versions } from './.vitepress/plugins/versions';

export default defineConfig(async () => {
  const versions = getPageckageVersions();

  const texts = getPageckageTexts();

  const [contributions] = await Promise.all([getContributors()]);

  return <UserConfig>{
    server: {
      // 监听地址
      host: true,
      // 端口号
      port: 8099
    },
    plugins: [
      MarkdownTransform(texts),
      Components({
        dirs: resolve(__dirname, '.vitepress/theme/components'),
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: './.vitepress/components.d.ts'
      }),
      Contributors(contributions),
      UnoCSS(),
      Versions(versions)
    ],
    resolve: {
      alias: {
        '@ny/monitor-browser': resolve(__dirname, 'monitor-browser/index.ts'),
        '@ny/monitor-core': resolve(__dirname, 'monitor-core/index.ts'),
        '@ny/monitor-shared': resolve(__dirname, 'monitor-shared/index.ts'),
        '@ny/monitor-types': resolve(__dirname, 'monitor-types/index.ts'),
        '@ny/monitor-utils': resolve(__dirname, 'monitor-utils/index.ts'),
        '@ny/monitor-vue': resolve(__dirname, 'monitor-vue/index.ts'),
        '@ny/monitor-business': resolve(__dirname, 'monitor-business/index.ts')
      }
    },
    css: {
      postcss: {
        plugins: [postcssNested]
      }
    }
  };
});
