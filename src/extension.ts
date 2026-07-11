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

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
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

    client.start().catch((error) => {
        vscode.window.showErrorMessage(
            `Failed to start Zenzic LSP. Please ensure zenzic is installed (e.g., 'uv tool install zenzic') or set the correct path in 'zenzic.executablePath'. Error: ${error.message}`
        );
    });
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
