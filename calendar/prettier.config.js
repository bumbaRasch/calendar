// @ts-check

/** @type {import('prettier').Config} */
const config = {
  // Core formatting
  semi: true,
  singleQuote: true,
  trailingComma: 'all',

  // Indentation and spacing
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,

  // Quote preferences
  quoteProps: 'as-needed',
  jsxSingleQuote: false,

  // Bracket and parentheses
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // Language-specific
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',

  // End of line
  endOfLine: 'lf',

  // File inclusions
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};

export default config;
