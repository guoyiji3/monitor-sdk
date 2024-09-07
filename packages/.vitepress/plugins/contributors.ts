import type { Plugin } from 'vite';
import type { ContributorInfo } from '../../../scripts/changelog';

const ID = 'virtual:contributors';

export function Contributors(data: ContributorInfo[]): Plugin {
  return {
    name: 'luban-contributors',
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
