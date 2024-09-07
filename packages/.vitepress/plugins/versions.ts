import type { Plugin } from 'vite';

const ID = 'virtual:versions';

export function Versions(data: Record<string, string>): Plugin {
  return {
    name: 'luban-versions',
    resolveId(id) {
      return id === ID ? ID : null;
    },
    load(id) {
      if (id === ID) {
        return `export default ${JSON.stringify(data)}`;
      }

      return null;
    }
  };
}
