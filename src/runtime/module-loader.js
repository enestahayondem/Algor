import fs from "node:fs";
import path from "node:path";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { AlgorError } from "../errors/algor-error.js";

export function loadProgram(program, entryFile) {
    const loaded = new Set();
    const active = new Set();

    function loadModule(file) {
        const absolutePath = path.resolve(file);

        if (active.has(absolutePath)) {
            throw new AlgorError(
                `Döngüsel modül aktarımı tespit edildi: ${absolutePath}`
            );
        }

        if (loaded.has(absolutePath)) {
            return [];
        }

        if (!fs.existsSync(absolutePath)) {
            throw new AlgorError(
                `Aktarılacak dosya bulunamadı: ${absolutePath}`
            );
        }

        active.add(absolutePath);

        let moduleProgram;

        try {
            const source = fs.readFileSync(absolutePath, "utf8");
            const tokens = new Lexer(source).tokenize();
            moduleProgram = new Parser(tokens).parse();
        } catch (error) {
            active.delete(absolutePath);
            throw error;
        }

        const exportedDeclarations = [];

        try {
            for (const statement of moduleProgram.statements) {
                if (statement.type === "ImportStatement") {
                    const dependency = path.resolve(
                        path.dirname(absolutePath),
                        statement.path
                    );

                    exportedDeclarations.push(...loadModule(dependency));
                    continue;
                }

                if (statement.type === "ExportFunctionDeclaration") {
                    exportedDeclarations.push({
                        ...statement,
                        type: "FunctionDeclaration"
                    });
                    continue;
                }

                if (statement.type === "ExportVariableDeclaration") {
                    exportedDeclarations.push({
                        ...statement,
                        type: "VariableDeclaration"
                    });
                    continue;
                }

                if (statement.type === "FunctionDeclaration") {
                    throw new AlgorError(
                        `Modül içindeki '${statement.name}' fonksiyonu 'disari' ile tanımlanmalı`
                    );
                }

                throw new AlgorError(
                    `Modül dosyalarında yalnızca aktar ve disari fonksiyon veya değişken tanımları kullanılabilir: ${absolutePath}`
                );
            }
        } finally {
            active.delete(absolutePath);
        }

        loaded.add(absolutePath);
        return exportedDeclarations;
    }

    const statements = [];

    for (const statement of program.statements) {
        if (statement.type === "ImportStatement") {
            const importedFile = path.resolve(
                path.dirname(path.resolve(entryFile)),
                statement.path
            );

            statements.push(...loadModule(importedFile));
        } else {
            statements.push(statement);
        }
    }

    return {
        type: "Program",
        statements
    };
}
