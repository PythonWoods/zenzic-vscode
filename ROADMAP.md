<!--
 SPDX-FileCopyrightText: 2026 PythonWoods

 SPDX-License-Identifier: Apache-2.0
-->

# Zenzic VS Code Extension: Roadmap & Technical Debt

This document tracks the technical debt and future architectural improvements for the VS Code extension (`zenzic-vscode`) and its interaction with the `zenzic` Language Server.

## Recent Releases

### [v0.22.0] Real-Time Global Context (VSM) Support
**Status: Completed**
- Processed `workspace/workspaceFolders` during initialization.
- Implemented a synchronous in-memory Virtual Site Map (VSM) calculation.
- Integrated $O(1)$ incremental updates via `workspace/didChangeWatchedFiles` without background threads.
- Enabled real-time feedback for structural rules (`Z101 Broken Link`, `Z104 File Not Found`, `Z105 Absolute Path`).

## [v0.23.0] Planned: Code Actions (Quick Fixes)
**Problem:**
While the CLI can automatically fix issues via `zenzic fix` (e.g., inserting missing attributes like `Z121` or removing dead comments `Z603`), the VS Code extension is purely passive.
**Solution:**
- Implement `textDocument/codeAction` in the backend.
- Suggest clickable Quick Fixes to the user for all rules exposing `fixable=True` in `CODE_DEFINITIONS`.

## Priority: DQS Scoring and Workspace UI
**Problem:**
The Documentation Quality Score (DQS) requires full suite analysis (rules like `Z502` or `Z504`). The extension currently does not report this vital metric.
**Solution:**
- Integrate a Zenzic-specific sidebar panel (Tree View).
- Display the globally updated score (potentially by interfacing with a background command `zenzic score --json`).

## Priority: Configuration Autocompletion (JSON Schema)
**Problem:**
There is no dedicated Intellisense when the user modifies `.zenzic.toml`.
**Solution:**
- Generate and host an official JSON Schema for Zenzic.
- Update `package.json` in `zenzic-vscode` using `jsonValidation` (and `toml`) to inject autocompletion for the configuration file.
