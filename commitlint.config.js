module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type的类型必须在指定范围内
    'type-enum': [
      2,
      'always',
      ['test', 'feat', 'fix', 'chore', 'docs', 'refactor', 'style', 'ci', 'perf', 'release', 'revert', 'build', 'publish']
    ]
  }
};
