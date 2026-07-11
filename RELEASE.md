<!-- SPDX-FileCopyrightText: 2026 PythonWoods <dev@pythonwoods.dev> -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
# Release Procedure — Zenzic VS Code Extension

> **[MAINTAINER SOP]** *This document contains the Standard Operating Procedure for compiling and publishing a new release of the Zenzic VS Code Extension. It is automatically synchronized by the bump tool.*

## Release Metadata

| Field | Value |
| :--- | :--- |
| **Extension Version** | 0.21.0 |
| **Pinned Core** | `zenzic>=0.21.0` |
| **Date** | 2026-07-11 |

## 1. Pre-Flight Checklist

Before bumping the version, ensure the workspace is pristine:

- [ ] `just verify` — exits 0 (ESLint, TSC, REUSE compliance verified)
- [ ] `npm run build` — esbuild successfully bundles `out/extension.js` without errors
- [ ] `CHANGELOG.md` — `[Unreleased]` section contains all new features and fixes
- [ ] `package.json` — dependencies are secure and lockfile is synced (`npm ci`)

## 2. Bump & Build

Do not manually edit version strings. Rely on the automated pipeline.

```bash
# 1. Automate version bump (updates package.json, CHANGELOG, and this file)
just release <patch|minor|major>

# 2. Package the extension binary
just verify
npm run build
npx @vscode/vsce package