import { defineConfig } from 'vitepress';
import packages from '../../meta/packages.json';
import metadata from '../metadata.json';

function getFunctionsSideBar() {
  const sidebar = {};

  const functions = packages.filter(({ text }) => text);

  functions.forEach(({ name }) => {
    sidebar[`/${name}/`] = metadata[name];
    sidebar[`/installation/${name}`] = metadata[name];
  });

  return sidebar;
}

function formatByPackageName(name: string) {
  const value = name.replace(/luban-/, '');

  return value.charAt(0).toUpperCase() + value.slice(1);
}

const FunctionsSideBar = getFunctionsSideBar();
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: ' ',
  titleTemplate: ':title | Luban Tools',
  description: 'JavaScript 实用业务工具库',
  head: [['link', { rel: 'icon', href: '/luban/favicon.ico' }]],
  base: '/luban',
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '指引', link: '/guide/start' },
      {
        text: '使用文档',
        items: packages
          .filter(({ text }) => text)
          .map(({ name, text }) => ({
            link: `/${name}/README.md`,
            text: `${text}（${formatByPackageName(name)}）`
          }))
      },
      { text: '发布日志', link: 'https://git.nykjsrv.cn/front-end/luban/-/releases' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指引',
          items: [
            { text: '开始', link: '/guide/start' },
            { text: '贡献', link: '/guide/contributing' },
            { text: '开发指南', link: '/guide/developing' },
            { text: '新建项目', link: '/guide/guidelines' },
            { text: '常见问题', link: '/guide/troubleshooting' }
          ]
        }
      ],
      ...FunctionsSideBar
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    outlineTitle: '当前页导航',
    outline: [2, 3],
    search: {
      provider: 'local'
    }
  },
  // build
  outDir: '../docs'
});
