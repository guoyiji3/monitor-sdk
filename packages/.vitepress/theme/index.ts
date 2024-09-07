import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import './styles/var.css';
import './styles/index.css';
import './styles/demo.css';
import NavBarTitle from './layout/NavBarTitle';

import 'uno.css';

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-after': () => h(NavBarTitle)
    });
  }
};
