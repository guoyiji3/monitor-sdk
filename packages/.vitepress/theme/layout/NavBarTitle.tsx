import { useRoute } from 'vitepress';
import { computed, defineComponent, h } from 'vue';
// @ts-expect-error virtual
import versions from 'virtual:versions';
import packages from '../../../../meta/packages.json';

export default defineComponent({
  setup() {
    const route = useRoute();
    const title = computed(() => {
      const { filePath } = route.data;

      const name = filePath.match(/^([^/]+)/)?.[1] || '';

      if (/^luban-/.test(name)) {
        const record = packages.find((el) => el.name === name);

        const version = versions[name];

        return [record?.text, h('span', { class: 'title-version' }, version)];
      }

      return 'Luban Tools';
    });

    return () => title.value;
  }
});
