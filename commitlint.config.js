module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Test additions or corrections
        'build',    // Build system or dependency changes
        'ci',       // CI/CD configuration changes
        'chore',    // Other changes (maintenance)
        'revert',   // Revert a previous commit
      ],
    ],

    // Scope enum - optional but validated if present
    'scope-enum': [
      1,
      'always',
      [
        'api',
        'rss',
        'database',
        'config',
        'docker',
        'ci',
        'docs',
        'tests',
        'deployment',
        'security',
        'monitoring',
        'performance',
      ],
    ],

    // Subject rules
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],

    // Type rules
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Body rules
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer rules
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    // Header rules
    'header-max-length': [2, 'always', 100],
  },
};
