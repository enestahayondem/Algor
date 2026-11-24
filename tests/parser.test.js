import { AlgorError } from "../src/errors/algor-error.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Lexer } from "../src/lexer/lexer.js";
import { Parser } from "../src/parser/parser.js";

function parse(source) {
    const tokens = new Lexer(source).tokenize();
    return new Parser(tokens).parse();
}

test("Değişken tanımlamalı", () => {
    const ast = parse('sayi yas = 18');

    assert.equal(ast.statements[0].type, "VariableDeclaration");
    assert.equal(ast.statements[0].name, "yas");
    assert.equal(ast.statements[0].initializer.value, 18);
});

test("Metin tanımlamalı", () => {
    const ast = parse('metin isim = "Enes"');

    assert.equal(ast.statements[0].initializer.value, "Enes");
});

test("Mantıksal değerleri tanımalı", () => {
    const ast = parse('mantik aktif = dogru');

    assert.equal(ast.statements[0].initializer.value, true);
});

test("Koşul oluşturmalı", () => {
    const ast = parse(`
        eger 18 >= 18 {
            yaz("Reşit")
        } degilse {
            yaz("Değil")
        }
    `);

    assert.equal(ast.statements[0].type, "IfStatement");
});

test("Döngü oluşturmalı", () => {
    const ast = parse(`
        dongu 1 <= 5 {
            yaz(1)
        }
    `);

    assert.equal(ast.statements[0].type, "WhileStatement");
});

test("Atama yapısını oluşturmalı", () => {
    const ast = parse(`
        sayi yas = 18
        yas = 20
    `);

    assert.equal(ast.statements[1].type, "AssignmentStatement");
});

console.log("ALGOR gelişmiş Parser testleri yüklendi!");
test("Eksik değişken değerinde Parser hatası vermeli", () => {
    const source = "sayi yas =";

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);

    assert.throws(
        () => parser.parse(),
        (error) => {
            assert.ok(error instanceof AlgorError);
            assert.equal(error.line, 1);
            assert.equal(error.column, 11);
            return true;
        }
    );
});

test("Eksik parantezde Parser hatası vermeli", () => {
    const source = 'yaz("Merhaba"';

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);

    assert.throws(
        () => parser.parse(),
        (error) => {
            assert.ok(error instanceof AlgorError);
            assert.equal(error.line, 1);
            assert.equal(error.column, 14);
            return true;
        }
    );
});

test("Sabit değişken tanımını AST üzerinde işaretlemeli", () => {
    const ast = parse("sabit sayi yas = 18");
    assert.equal(ast.statements[0].type, "VariableDeclaration");
    assert.equal(ast.statements[0].isConstant, true);
});

test("Normal değişkeni sabit olarak işaretlememeli", () => {
    const ast = parse("sayi yas = 18");
    assert.equal(ast.statements[0].isConstant, false);
});

test("Sabit tanımında tür belirtilmesini zorunlu tutmalı", () => {
    assert.throws(
        () => parse("sabit isim = 18"),
        /sabit komutundan sonra bir tür belirtilmeli/
    );
});
