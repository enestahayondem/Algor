#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import { Lexer } from "./lexer/lexer.js";
import { Parser } from "./parser/parser.js";
import { Interpreter } from "./runtime/interpreter.js";
import { loadProgram } from "./runtime/module-loader.js";

const file = process.argv[2];

if (!file) {
    console.log("ALGOR programlama dili");
    console.log("Kullanım: algor dosya.algor");
    process.exit(1);
}

try {
    const absoluteFile = path.resolve(file);
    const source = fs.readFileSync(absoluteFile, "utf8");
    const tokens = new Lexer(source).tokenize();
    const parsedProgram = new Parser(tokens).parse();
    const program = loadProgram(parsedProgram, absoluteFile);

    const interpreter = new Interpreter();
    interpreter.run(program);
} catch (error) {
    console.error("ALGOR Hatası:", error.message);
    process.exit(1);
}
