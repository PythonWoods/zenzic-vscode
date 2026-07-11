// SPDX-FileCopyrightText: 2026 PythonWoods
//
// SPDX-License-Identifier: Apache-2.0

import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    Executable,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(sync~spin) Zenzic: Starting';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const startServer = async () => {
        const config = vscode.workspace.getConfiguration('zenzic');
        const executablePath = config.get<string>('executablePath') || 'zenzic';

        const run: Executable = {
            command: executablePath,
            args: ['lsp'],
            transport: TransportKind.stdio
        };

        const serverOptions: ServerOptions = {
            run: run,
            debug: run
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                { scheme: 'file', language: 'markdown' },
                { scheme: 'file', language: 'mdx' },
                { scheme: 'untitled', language: 'markdown' },
                { scheme: 'untitled', language: 'mdx' }
            ]
        };

        client = new LanguageClient(
            'zenzicLanguageServer',
            'Zenzic Language Server',
            serverOptions,
            clientOptions
        );

        try {
            await client.start();
            statusBarItem.text = '$(check) Zenzic: Running';
            statusBarItem.tooltip = 'Zenzic Language Server is running';
        } catch (error: any) {
            statusBarItem.text = '$(error) Zenzic: Error';
            statusBarItem.tooltip = 'Zenzic Language Server failed to start';
            vscode.window.showErrorMessage(
                `Failed to start Zenzic LSP. Please ensure zenzic is installed (e.g., 'uv tool install zenzic') or set the correct path in 'zenzic.executablePath'. Error: ${error.message}`
            );
        }
    };

    const restartServer = async () => {
        statusBarItem.text = '$(sync~spin) Zenzic: Restarting';
        if (client) {
            await client.stop();
            client = undefined;
        }
        await startServer();
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('zenzic.restartServer', async () => {
            await restartServer();
        })
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
    return client.stop();
}
