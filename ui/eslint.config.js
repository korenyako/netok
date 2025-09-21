import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/i18n/**/*', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.config.{ts,js}', 'src/test/**/*'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[raw=/[А-Яа-яЁё]/]',
          message: 'Hardcoded Cyrillic strings are not allowed. Use i18n with t() function instead.',
        },
        {
          selector: 'Literal[raw=/^[A-Z][a-z]+ [a-z]+/]',
          message: 'Hardcoded English strings are not allowed. Use i18n with t() function instead.',
        },
      ],
    },
  },
  // Allow i18n files to have any strings
  {
    files: ['src/i18n/**/*'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Allow test files to have hardcoded strings
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**/*'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Allow config files to have hardcoded strings
  {
    files: ['**/*.config.{ts,js}', 'vite.config.ts', 'tailwind.config.js'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
])
