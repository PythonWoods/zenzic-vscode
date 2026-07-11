<!--
SPDX-FileCopyrightText: 2026 PythonWoods

SPDX-License-Identifier: Apache-2.0
-->

# Zenzic — VS Code Extension

> Real-time static analysis and credential scanning for Markdown and MDX, powered by the Zenzic Language Server.

[![CI](https://github.com/PythonWoods/zenzic-vscode/actions/workflows/ci.yml/badge.svg)](https://github.com/PythonWoods/zenzic-vscode/actions/workflows/ci.yml)
[![GitHub Release](https://img.shields.io/github/v/release/PythonWoods/zenzic-vscode?label=release)](https://github.com/PythonWoods/zenzic-vscode/releases/latest)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![REUSE compliant](https://img.shields.io/badge/REUSE-compliant-green.svg)](https://reuse.software/)

---

## Installation

### Option A — VS Code Marketplace

> [!NOTE]
> Marketplace publication is coming soon. The extension is currently distributed via GitHub Releases (see Option B below).

Once published, install with one click from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) by searching for **"Zenzic"**, or via the CLI:

```bash
code --install-extension pythonwoods.zenzic-vscode
```

---

### Option B — GitHub Releases (Current Method)

1. Go to the [**Releases page**](https://github.com/PythonWoods/zenzic-vscode/releases/latest) and download the latest `.vsix` file (e.g. `zenzic-vscode-0.21.2.vsix`).

2. Install it from the terminal:
   ```bash
   code --install-extension zenzic-vscode-<version>.vsix
   ```
   Or from within VS Code: `Ctrl+Shift+P` → **"Extensions: Install from VSIX..."**

3. Reload VS Code. The Zenzic status indicator will appear in the bottom-right status bar.

---

### Option C — Build from Source

```bash
# Clone the repository
git clone https://github.com/PythonWoods/zenzic-vscode.git
cd zenzic-vscode

# Install dependencies and package the extension
npm ci
npx @vscode/vsce package

# Install the generated .vsix
code --install-extension zenzic-vscode-*.vsix
```

---

## Requirements

This extension is a **thin client**: it delegates all analysis to the Zenzic engine process running on your machine. You must have the Zenzic core installed before the extension can function.

### Install Zenzic (recommended — via `uv`)

```bash
uv tool install zenzic
```

### Install via `pip`

```bash
pip install zenzic
```

### Verify the installation

```bash
zenzic --version
```

The extension will locate the `zenzic` binary automatically if it is on your system `$PATH`. For virtual-environment setups, see [Configuration](#configuration) below.

---

## Features

The extension provides a seamless bridge between the high-performance Zenzic engine and your editor:

| Feature | Description |
| :--- | :--- |
| **Sub-50ms Diagnostics** | Near-instantaneous linting and analysis feedback as you type, with zero manual configuration. |
| **Credential Scanning** | Automatic detection of secrets and security vulnerabilities, surfaced as inline diagnostics and mapped to Zenzic's Exit 2 credential scanning system. |
| **Structural Analysis** | Deep AST-level inspection and structural validation of Markdown and MDX files without relying on external Node.js parsers. |
| **Multi-scheme Support** | Works on both saved files (`file://`) and unsaved buffers (`untitled://`). |
| **Supported Languages** | `markdown`, `mdx` |

---

## Configuration

All settings are available via **File → Preferences → Settings** (search for `zenzic`) or by editing your `settings.json` directly.

### `zenzic.executablePath`

The path to the Zenzic binary used to launch the Language Server.

| Value | Description |
| :--- | :--- |
| `"zenzic"` *(default)* | Resolves the binary from your system `$PATH`. |
| Absolute path | Points directly to a specific binary. |
| Workspace-relative path | Use VS Code's `${workspaceFolder}` variable for project-local environments. |

**Examples:**

```jsonc
// settings.json

// System-wide installation (default — no configuration needed)
"zenzic.executablePath": "zenzic"

// Project-local virtual environment (uv or venv)
"zenzic.executablePath": "${workspaceFolder}/.venv/bin/zenzic"

// Explicit absolute path
"zenzic.executablePath": "/home/user/.local/share/uv/tools/zenzic/bin/zenzic"
```

---

## Commands

Access all commands via `Ctrl+Shift+P` (or `⌘+Shift+P` on macOS):

| Command | ID | Description |
| :--- | :--- | :--- |
| **Zenzic: Restart Server** | `zenzic.restartServer` | Terminates and respawns the Language Server process. Useful after updating the Zenzic binary or modifying custom rule configurations. |

---

## Status Bar

The Zenzic status indicator appears in the bottom-right corner of the VS Code status bar:

| Indicator | Meaning |
| :--- | :--- |
| `⟳ Zenzic: Starting` | The Language Server is initializing. |
| `✓ Zenzic: Running` | The Language Server is active and ready. |
| `⚠ Zenzic: Error` | The server failed to start. Check the error notification for details. |
| `⟳ Zenzic: Restarting` | A restart is in progress. |

---

## Troubleshooting

**The server fails to start with "executable not found"**
> Ensure `zenzic` is installed and accessible. Run `zenzic --version` in your terminal. If you use a virtual environment, set `zenzic.executablePath` to the full path of the binary within that environment.

**Diagnostics are not appearing for my `.md` file**
> Open the VS Code Output panel (`Ctrl+Shift+U`) and select **"Zenzic Language Server"** from the dropdown. Look for connection or startup errors.

**I updated Zenzic but the old version is still running**
> Run **"Zenzic: Restart Server"** from the Command Palette (`Ctrl+Shift+P`).

---

## License

This project is licensed under the [Apache-2.0 License](LICENSE) and is [REUSE 3.3](https://reuse.software/) compliant.
