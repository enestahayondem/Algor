const vscode = require("vscode");
const path = require("node:path");

let terminal;

function activate(context) {
    const runCommand = vscode.commands.registerCommand(
        "algor.runFile",
        async (uri) => {
            const editor = vscode.window.activeTextEditor;

            const document = uri
                ? await vscode.workspace.openTextDocument(uri)
                : editor?.document;

            if (!document || document.languageId !== "algor") {
                vscode.window.showWarningMessage(
                    "Önce bir ALGOR dosyası açmalısın."
                );
                return;
            }

            if (document.isDirty) {
                await document.save();
            }

            const cliPath = path.join(
                context.extensionPath,
                "node_modules",
                "@enestaha",
                "algor",
                "src",
                "cli.js"
            );

            if (!terminal || terminal.exitStatus) {
                terminal = vscode.window.createTerminal("ALGOR");
            }

            terminal.show();

            const quote = (value) => `"${value.replace(/(["\\$`])/g, "\\$1")}"`;

            terminal.sendText(
                `node ${quote(cliPath)} ${quote(document.fileName)}`
            );
        }
    );

    context.subscriptions.push(runCommand);
}

function deactivate() {
    terminal = undefined;
}

module.exports = { activate, deactivate };
