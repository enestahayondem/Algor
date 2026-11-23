
import { test } from "node:test";
import assert from "node:assert/strict";

import { Lexer } from "../src/lexer/lexer.js";
import { Parser } from "../src/parser/parser.js";

test("ALGOR değişken tanımlama ve yazdırma komutlarını anlamalı", () => {
    const source = `
        sayi yas = 18
        yaz(yas)
    `;

    const tokens = new Lexer(source).tokenize();
    const ast = new Parser(tokens).parse();

    assert.equal(ast.type, "Program");
    assert.equal(ast.statements.length, 2);

    assert.equal(ast.statements[0].type, "VariableDeclaration");
    assert.equal(ast.statements[0].name, "yas");
    assert.equal(ast.statements[0].value.value, 18);

    assert.equal(ast.statements[1].type, "PrintStatement");

    console.log("ALGOR Parser testi başarılı!");
});
