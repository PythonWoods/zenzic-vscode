// SPDX-FileCopyrightText: 2026 PythonWoods
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    Executable
} from 'vscode-languageclient/node';

// A4 fix: typed as | undefined — initialized in activate(), disposed via subscriptions.
let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem | undefined;
// A2 fix: guard flag prevents concurrent restart calls.
let restarting = false;

export async function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(sync~spin) Zenzic: Starting';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const startServer = async () => {
        const config = vscode.workspace.getConfiguration('zenzic');
        const executablePath = config.get<string>('executablePath') || 'zenzic';

        // A6 fix: resolve the executable path (absolute or via PATH) before spawning
        // to provide a user-friendly error message instead of an opaque LSP crash.
        const resolveExecutable = async (cmd: string): Promise<string | undefined> => {
            const isWindows = process.platform === 'win32';
            const exts = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];
            
            const checkPath = async (p: string): Promise<string | undefined> => {
                for (const ext of exts) {
                    try {
                        await fs.promises.access(p + ext, fs.constants.X_OK);
                        return p + ext;
                    } catch {
                        // ignore and try next extension or path
                    }
                }
                return undefined;
            };

            if (path.isAbsolute(cmd) || cmd.includes(path.sep) || (isWindows && cmd.includes('/'))) {
                return await checkPath(cmd);
            }

            const paths = (process.env.PATH || '').split(path.delimiter);
            for (const dir of paths) {
                if (!dir) continue;
                const fullPath = path.join(dir, cmd);
                const resolved = await checkPath(fullPath);
                if (resolved) return resolved;
            }
            return undefined;
        };

        const resolvedPath = await resolveExecutable(executablePath);

        if (!resolvedPath) {
            statusBarItem!.text = '$(error) Zenzic: Not Found';
            statusBarItem!.tooltip = `Executable not found: '${executablePath}'. Run: uv tool install zenzic`;
            // Offer actionable shortcuts so the user can resolve the issue without
            // leaving the editor. "Install with uv" opens the terminal with the
            // recommended command; "Open Docs" navigates to the README anchor.
            const action = await vscode.window.showErrorMessage(
                `Zenzic executable not found: '${executablePath}'. ` +
                `Install the core engine first, then restart VS Code.`,
                'Install with uv',
                'Open Docs'
            );
            if (action === 'Install with uv') {
                const terminal = vscode.window.createTerminal('Zenzic Setup');
                terminal.show();
                terminal.sendText('uv tool install zenzic', false);

                // VS Code installed as a snap/flatpak runs in an isolated process
                // whose PATH does not include the user's ~/.local/bin. After
                // installing via uv, the binary is reachable but invisible to the
                // extension. Offer automatic path detection via `uv tool dir --bin`
                // so the user never has to locate the directory manually.
                const followUp = await vscode.window.showInformationMessage(
                    'After the installation completes in the terminal, click ' +
                    '"Set Path Automatically" so Zenzic can locate the binary ' +
                    '(required if VS Code is installed as a snap or flatpak).',
                    'Set Path Automatically',
                    'Dismiss'
                );
                if (followUp === 'Set Path Automatically') {
                    try {
                        const cp = await import('child_process');
                        const binDir: string = await new Promise((resolve, reject) => {
                            cp.exec('uv tool dir --bin', (err, stdout) => {
                                if (err) { reject(err); } else { resolve(stdout.trim()); }
                            });
                        });
                        const zenzicBin = path.join(binDir, 'zenzic');
                        const cfg = vscode.workspace.getConfiguration('zenzic');
                        await cfg.update('executablePath', zenzicBin, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(
                            `Zenzic path set to: ${zenzicBin}. Starting server…`
                        );
                        // Restart so the updated executablePath is picked up immediately.
                        await restartServer();
                    } catch {
                        vscode.window.showErrorMessage(
                            'Could not auto-detect the uv tools directory. ' +
                            'Set "zenzic.executablePath" manually in your VS Code settings.'
                        );
                    }
                }
            } else if (action === 'Open Docs') {
                vscode.env.openExternal(vscode.Uri.parse(
                    'https://github.com/PythonWoods/zenzic-vscode#requirements'
                ));
            }
            return;
        }

        const run: Executable = {
            command: resolvedPath,
            args: ['lsp']
        };


        // A5: debug config is intentionally identical to run. This extension is a
        // thin client: server-side debugging is done by attaching directly to the
        // zenzic process, not through a dedicated debug launcher.
        const serverOptions: ServerOptions = { run, debug: run };

        const outputChannel = vscode.window.createOutputChannel('Zenzic Language Server', { log: true });

        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                { scheme: 'file', language: 'markdown' },
                { scheme: 'file', language: 'mdx' },
                { scheme: 'untitled', language: 'markdown' },
                { scheme: 'untitled', language: 'mdx' }
            ],
            outputChannel
        };

        client = new LanguageClient(
            'zenzicLanguageServer',
            'Zenzic Language Server',
            serverOptions,
            clientOptions
        );

        try {
            await client.start();
            statusBarItem!.text = '$(check) Zenzic: Running';
            statusBarItem!.tooltip = 'Zenzic Language Server is running';
        } catch (err: unknown) {
            // A1 fix: err is unknown; narrow to Error before accessing .message to
            // avoid producing "Error: undefined" when a non-Error value is thrown.
            const message = err instanceof Error ? err.message : String(err);
            statusBarItem!.text = '$(error) Zenzic: Error';
            statusBarItem!.tooltip = 'Zenzic Language Server failed to start';
            vscode.window.showErrorMessage(
                `Failed to start Zenzic LSP. Please ensure zenzic is installed ` +
                `(e.g., 'uv tool install zenzic') or set the correct path in ` +
                `'zenzic.executablePath'. Error: ${message}`
            );
        }
    };

    const restartServer = async () => {
        // A2 fix: idempotent guard — if a restart is already in flight, ignore the
        // duplicate call instead of spawning a second concurrent LSP client.
        if (restarting) { return; }
        restarting = true;
        try {
            statusBarItem!.text = '$(sync~spin) Zenzic: Restarting';
            if (client) {
                await client.stop();
                client = undefined;
            }
            await startServer();
        } finally {
            restarting = false;
        }
    };

    const stopServer = async () => {
        if (client) {
            statusBarItem!.text = '$(sync~spin) Zenzic: Stopping';
            await client.stop();
            client = undefined;
            statusBarItem!.text = '$(stop-circle) Zenzic: Stopped';
            statusBarItem!.tooltip = 'Zenzic Language Server is stopped';
        }
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('zenzic.restartServer', restartServer),
        vscode.commands.registerCommand('zenzic.startServer', startServer),
        vscode.commands.registerCommand('zenzic.stopServer', stopServer)
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('zenzic.executablePath')) {
                await restartServer();
            }
        })
    );

    await startServer();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    // A3 fix: swallow rejection from stop() — the server process may have already
    // exited (e.g., crashed), in which case stop() rejects with a benign error.
    return client.stop().catch(() => { /* server already stopped */ });
}
