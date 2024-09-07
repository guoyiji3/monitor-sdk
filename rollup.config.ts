import type { OutputOptions, RollupOptions } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import { readJSONSync } from './scripts/utils';

const packages = readJSONSync('meta/packages.json');

const pluginDts = dts();

const esbuildTarget = (target = 'chrome53') => esbuild({ target, drop: ['console', 'debugger'] });

const configs: RollupOptions[] = [];

for (let i = 0; i < packages.length; i += 1) {
  const { name, declare, mjs, target } = packages[i];

  const external: string[] = [];

  const pkg = readJSONSync(`packages/${name}/package.json`);

  Object.keys(pkg.dependencies || {}).forEach((key) => external.push(key));

  const functionNames = ['index'];

  Object.keys(pkg.exports || {}).forEach((key) => {
    const submodule = key.replace(/^\.\/?/, '');

    submodule && functionNames.push(submodule);
  });

  for (let j = 0; j < functionNames.length; j += 1) {
    const fn = functionNames[j];

    const input = `packages/${name}/${fn}.ts`;

    const output: OutputOptions[] = [];

    // esm
    mjs !== false && output.push({ file: `packages/${name}/dist/${fn}.esm.mjs`, format: 'es' });

    // cjs
    output.push({ file: `packages/${name}/dist/${fn}.cjs.js`, format: 'cjs', minifyInternalExports: true });

    configs.push({
      input,
      output,
      external,
      plugins: [
        resolve(),
        commonjs({
          exclude: 'node_modules'
        }),
        json(),
        esbuildTarget(target),
        cleanup({
          comments: 'none'
        })
      ]
    });

    if (declare !== false) {
      configs.push({
        input,
        output: [
          { file: `packages/${name}/dist/${fn}.d.ts` },
          { file: `packages/${name}/dist/${fn}.d.cts` },
          { file: `packages/${name}/dist/${fn}.d.mts` }
        ],
        external,
        plugins: [pluginDts]
      });
    }
  }
}

console.log('configs', configs);

export default configs;
