#!/usr/bin/env node

import fs from "node:fs";
import { Lexer } from "./lexer/lexer.js";
import { Parser } from "./parser/parser.js";
import { Interpreter } from "./runtime/interpreter.js";

const file = process.argv[2];

if (!file) {
    console.log("ALGOR programlama dili");
    console.log("Kullanım: algor dosya.algor");
    process.exit(1);
}

try {
    const source = fs.readFileSync(file, "utf8");

    const tokens = new Lexer(source).tokenize();
    const program = new Parser(tokens).parse();

    const interpreter = new Interpreter();
    interpreter.run(program);

} catch (error) {
    console.error("ALGOR Hatası:", error.message);
    process.exit(1);
}