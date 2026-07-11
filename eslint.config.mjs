// SPDX-FileCopyrightText: 2026 PythonWoods
//
// SPDX-License-Identifier: Apache-2.0

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Module = require('module');

// Intercept CJS require calls for 'typescript' and redirect to '@typescript/typescript6'
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'typescript') {
    return originalLoad('@typescript/typescript6', parent, isMain);
  }
  return originalLoad(request, parent, isMain);
};

// Dynamically import plugins so they use the overridden loader hook
const typescriptEslint = (await import('@typescript-eslint/eslint-plugin')).default;
const typescriptParser = (await import('@typescript-eslint/parser')).default;
const js = (await import('@eslint/js')).default;

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
