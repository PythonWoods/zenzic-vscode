<p align="center">
  <img src="images/logo.png" width="128" alt="Zenzic Logo">
</p>

<h1 align="center">Zenzic: Deterministic Document Integrity</h1>

<p align="center">
  <strong>Sub-50ms topological validation and credential scanning for documentation graphs.</strong>
</p>

---

Zenzic is a strict, deterministic static analysis engine for Markdown and MDX.

This extension brings the exact same $O(N)$ validation engine used in your CI/CD pipelines directly into your authoring environment, providing real-time feedback as you type.

## Thin Client Architecture

This extension is a strictly **Thin Client**. It contains zero parsing logic, zero regex engines, and zero validation rules. It communicates via the Language Server Protocol (LSP) over standard I/O directly with the Zenzic Python binary installed on your system.

## Features

### Real-Time Topological Validation

Modify a heading in one file, and Zenzic instantly invalidates any broken links pointing to that anchor across your entire workspace using $O(K)$ incremental graph patching.

```markdown
  [Read the setup guide](./setup.md#installation)
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Z102: Anchor '#installation' not found in 'setup.md'.
```

### Instant Credential Scanning

Hardcoded secrets are flagged in milliseconds using strict RE2 validation, preventing leaks before the file is even saved.

```markdown
  export GITHUB_TOKEN="ghp_************************************"
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  Z201: Critical security violation. GitHub Personal Access Token detected.
```

### Deterministic Quality Score (DQS)

Hover over any diagnostic to see the exact Z-Code, the Document Quality Score penalty, and deterministic remediation guidance directly from the Core engine.

## Requirements

Because this is a thin client, **you must install the Zenzic Python Core (v0.23.2 or higher)** on your machine.

We recommend using `uv`:

```bash
uv tool install zenzic
```

To upgrade an existing installation:

```bash
uv tool upgrade zenzic
```

## Extension Settings

By default, the extension will look for the `zenzic` binary in your system's PATH.

If you are using a local virtual environment or a custom installation path, configure the executable path in your workspace or user `settings.json`:

```json
{
  "zenzic.executablePath": "${workspaceFolder}/.venv/bin/zenzic"
}
```

## Architectural Guarantees

- **Zero Telemetry:** Zenzic operates entirely locally. No data is sent to the cloud.
- **Zero LLMs:** All analysis is mathematically deterministic. No probabilistic guessing.
- **Sub-50ms Latency:** Incremental graph patching ensures real-time feedback regardless of workspace size.

---

For the full finding taxonomy and architectural documentation, visit [zenzic.dev](https://zenzic.dev).
