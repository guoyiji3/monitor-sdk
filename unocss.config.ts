import { defineConfig, presetAttributify, presetUno } from 'unocss';

export default defineConfig({
  shortcuts: {},
  presets: [presetUno(), presetAttributify()],
  theme: {}
});
