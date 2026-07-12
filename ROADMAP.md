<!--
 SPDX-FileCopyrightText: 2026 PythonWoods

 SPDX-License-Identifier: Apache-2.0
-->

# Zenzic VS Code Extension: Roadmap & Technical Debt

Questo documento traccia il debito tecnico e i futuri miglioramenti architetturali per l'estensione VS Code (`zenzic-vscode`) e la sua interazione con il Language Server di `zenzic`.

## Priorità 1: Supporto al Contesto Globale (VSM) in Real-time
**Problema:**
Oggi il `zenzic lsp` è *stateless* e analizza i file singolarmente in memoria. Di conseguenza, non possiede un *Virtual Site Map* (VSM) e ignora tutte le regole di tipo strutturale (`Z101 Broken Link`, `Z104 File Not Found`, `Z105 Absolute Path`).
**Soluzione:**
- Gestire il `workspace/workspaceFolders` nell'Initialize.
- Aggiungere un thread in background che calcoli un VSM globale in memoria e reagisca a `workspace/didChangeWatchedFiles`.
- Sfruttare la cache del VSM nel metodo `check_vsm` delle regole affinché l'utente abbia un feedback immediato anche sui link rotti.

## Priorità 2: Code Actions (Quick Fixes)
**Problema:**
Mentre la CLI può correggere in automatico tramite `zenzic fix` (ad esempio inserendo gli attributi mancanti come in `Z121` o rimuovendo commenti morti `Z603`), l'estensione VS Code è puramente passiva.
**Soluzione:**
- Implementare `textDocument/codeAction` nel backend.
- Suggerire *Quick Fixes* cliccabili dall'utente per tutte le regole che espongono `fixable=True` in `CODE_DEFINITIONS`.

## Priorità 3: DQS Scoring e UI del Workspace
**Problema:**
Il punteggio DQS (Documentation Quality Score) come la regola `Z502` o `Z504` richiede l'analisi completa della suite. L'estensione non riporta questa metrica vitale.
**Soluzione:**
- Integrare un pannello laterale (Tree View) specifico di Zenzic.
- Visualizzare il punteggio globale aggiornato (magari interfacciandosi con un comando background `zenzic score --json`).

## Priorità 4: Autocompletamento Configurazione (JSON Schema)
**Problema:**
Nessun Intellisense dedicato quando l'utente modifica `.zenzic.toml`.
**Soluzione:**
- Generare e ospitare un JSON Schema ufficiale per Zenzic.
- Aggiornare `package.json` di `zenzic-vscode` usando `jsonValidation` (e `toml`) per iniettare l'autocompletamento per la configurazione.
