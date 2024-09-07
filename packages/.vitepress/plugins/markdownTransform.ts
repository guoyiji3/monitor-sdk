/* eslint-disable consistent-return */
import fs from 'node:fs';
import type { Plugin } from 'vite';

function getFunctionMarkdown(mdPath: string, fileName: string) {
  const name = fileName.replace(/\.md$/, '');

  const demoPath = ['demo.vue', `${name}.vue`].find((i) => fs.existsSync(mdPath.replace(fileName, i)));

  const demoSection = demoPath
    ? `
<script setup>
import Demo from './${demoPath}'
</script>

## 演示
<DemoContainer>
  <ClientOnly>
    <Demo/>
    <template #fallback>
      Loading demo...
    </template>
  </ClientOnly>
</DemoContainer>
`
    : '';

  return { demoSection };
}

export function MarkdownTransform(texts: Record<string, string>): Plugin {
  function getFrontmatterMarkdown(mdPath: string, frontmatterStarts: number) {
    const [, name] = mdPath.match(/\/(luban-[^/]+)\//) || [];

    if (!name) return { frontmatter: '', sliceIndex: 0 };

    let frontmatter = `titleTemplate: ${texts[name]}\n`;

    if (frontmatterStarts === -1) frontmatter = `---\n titleTemplate: ${texts[name]}\n---\n`;

    return { frontmatter, sliceIndex: frontmatterStarts < 0 ? 0 : frontmatterStarts + 4 };
  }
  return {
    name: 'luban-md-transform',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.match(/\.md\b/)) return;
      const [, , i] = id.split('/').slice(-3);
      // 处理传入 md 文档
      if (!i.endsWith('.md')) return;

      let content = code;

      const frontmatterStarts = code.indexOf('---\n');

      const { demoSection } = getFunctionMarkdown(id, i);

      const { frontmatter, sliceIndex } = getFrontmatterMarkdown(id, frontmatterStarts);

      if (frontmatter) content = content.slice(0, sliceIndex) + frontmatter + content.slice(sliceIndex);

      content += demoSection;

      return content;
    }
  };
}
