<!--
SPDX-FileCopyrightText: 2026 PythonWoods

SPDX-License-Identifier: Apache-2.0
-->

# Zenzic VS Code Extension

This is the official Visual Studio Code client for the **Zenzic Language Server**. It provides real-time, zero-configuration static analysis directly within your editor.

## Features

This extension bridges the high-performance Zenzic backend to your editor, providing:
- **Sub-50ms Diagnostics:** Near-instantaneous linting and analysis feedback for Markdown and MDX files.
- **Credential Scanning:** Immediate detection of secrets and security vulnerabilities, mapped directly to Zenzic's Exit 2 credential scanning system.
- **Structural Analysis:** Deep AST-level inspection and structural validation without relying on external Node.js parsers.

## Requirements

This extension operates as a lightweight thin client. It **does not** bundle the Zenzic engine.

You **MUST** have the Zenzic core engine installed on your system or within your project's virtual environment.

Install globally via `uv`:
```bash
uv tool install zenzic==0.21.0
```

Or install via `pip`:
```bash
pip install zenzic==0.21.0
```

## Configuration

You can configure the extension via your `settings.json` or the VS Code settings UI.

- `zenzic.executablePath`: The absolute path to the Zenzic binary.
  - **Default:** `"zenzic"` (relies on your system `$PATH`).
  - **Virtual Environment:** If your project uses a localized virtual environment, you can point the client precisely to it using workspace variables:
    ```json
    "zenzic.executablePath": "${workspaceFolder}/.venv/bin/zenzic"
    ```

## Commands

- **Zenzic: Restart Server** (`zenzic.restartServer`): Manually terminates and respawns the Language Server process. Useful when modifying custom rule configurations or updating the Zenzic binary.
