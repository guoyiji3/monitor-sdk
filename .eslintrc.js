module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx']
      },
      typescript: {}
    }
  },
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
        groups: ['builtin', 'type', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: []
      }
    ],
    'no-console': 'off',
    'no-bitwise': 'off',
    'no-continue': 'off',
    'no-cond-assign': 'off',
    'no-underscore-dangle': 'off',
    'max-len': 'off',
    // export 要有 default
    'import/prefer-default-export': 'off',
    //
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    // 引入文件结尾带上 扩展名
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // 禁止使用无关的包
    'import/no-extraneous-dependencies': 'off',
    //
    'no-return-assign': 'off',
    //
    '@typescript-eslint/no-explicit-any': 'off',
    //
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 不允许重新分配function参数
    'no-param-reassign': ['error', { props: false }],
    // 要求使用Error对象作为Promise拒绝原因
    'prefer-promise-reject-errors': 'off'
  }
};
