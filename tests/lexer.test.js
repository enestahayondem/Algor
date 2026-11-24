
import { test } from "node:test";
import assert from "node:assert/strict";
import { Lexer } from "../src/lexer/lexer.js";
import { AlgorError } from "../src/errors/algor-error.js";

test("ALGOR sayıları ve kelimeleri tanımalı", () => {
    const lexer = new Lexer("sayi yas = 18");
    const tokens = lexer.tokenize();

    assert.equal(tokens[0].value, "sayi");
    assert.equal(tokens[1].value, "yas");
    assert.equal(tokens[2].value, "=");
    assert.equal(tokens[3].value, 18);
});

test("Bilinmeyen karakterde satır ve sütun göstermeli", () => {
    assert.throws(
        () => new Lexer("sayi yas = 18\n@").tokenize(),
        (error) => {
            assert.ok(error instanceof AlgorError);
            assert.equal(error.line, 2);
            assert.equal(error.column, 1);
            return true;
        }
    );
});

test("Kapatılmamış metin hatasını yakalamalı", () => {
    assert.throws(
        () => new Lexer('metin isim = "Enes').tokenize(),
        (error) => {
            assert.ok(error instanceof AlgorError);
            assert.equal(error.line, 1);
            assert.equal(error.column, 14);
            return true;
        }
    );
});

console.log("ALGOR Lexer testleri başarılı!");
