// SPDX-FileCopyrightText: 2026 PythonWoods
//
// SPDX-License-Identifier: Apache-2.0

import * as fs from 'fs';
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

        // A6 fix: pre-validate absolute paths before spawning the process so the
        // error message is immediate and user-friendly rather than an opaque LSP crash.
        if (executablePath !== 'zenzic') {
            try {
                await fs.promises.access(executablePath, fs.constants.X_OK);
            } catch {
                statusBarItem!.text = '$(error) Zenzic: Not Found';
                statusBarItem!.tooltip = `Executable not found at: ${executablePath}`;
                vscode.window.showErrorMessage(
                    `Zenzic executable not found at '${executablePath}'. ` +
                    `Please check the 'zenzic.executablePath' setting.`
                );
                return;
            }
        }

        const run: Executable = {
            command: executablePath,
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
