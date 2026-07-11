// SPDX-FileCopyrightText: 2026 PythonWoods
//
// SPDX-License-Identifier: Apache-2.0

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Module = require('module');

// ─── TypeScript 7 / typescript-eslint v8 compatibility shim ──────────────────
//
// B1 KNOWN LIMITATION: TypeScript 7 rewrote the compiler in Go and removed the
// stable programmatic API that typescript-eslint v8 depends on.
//
// Workaround: intercept CJS require('typescript') calls made by the eslint plugins
// and redirect them to @typescript/typescript6 — Microsoft's official bridge shim
// that re-exposes the TypeScript 6.x programmatic API alongside the TS7 compiler.
//
// REMOVAL CRITERIA: Remove this block (and @typescript/typescript6 + @eslint/js
// from devDependencies) once typescript-eslint releases a version with native TS7
// support (expected with typescript-eslint v9 / TypeScript 7.1).
//
// WARNING: Module._load is a Node.js internal API — not part of the public
// contract. It may break on Node.js major version updates. If it breaks, the fix
// is the same: wait for official typescript-eslint TS7 support.
// ─────────────────────────────────────────────────────────────────────────────
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'typescript') {
    return originalLoad('@typescript/typescript6', parent, isMain);
  }
  return originalLoad(request, parent, isMain);
};

// Dynamically import plugins so they use the overridden loader hook above.
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
      // B2 fix: no-undef is off because TypeScript's type system covers this
      // comprehensively; keeping both active produces duplicate noise.
      'no-undef': 'off',
      // B2 fix: downgraded from 'off' to 'warn' — unused vars are a signal of
      // stale code; 'warn' surfaces them without blocking CI.
      '@typescript-eslint/no-unused-vars': 'warn',
      // B2 fix: downgraded from 'off' to 'warn' — any usage should be reviewed;
      // if intentional, suppress per-site with an inline eslint-disable comment.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
