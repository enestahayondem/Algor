
import { test } from "node:test";
import assert from "node:assert";
import { Lexer } from "../src/lexer/lexer.js";

test("ALGOR sayıları ve kelimeleri tanımalı", () => {
    const lexer = new Lexer("sayi yas = 18");
    const tokens = lexer.tokenize();

    assert.equal(tokens[0].value, "sayi");
    assert.equal(tokens[1].value, "yas");
    assert.equal(tokens[2].value, "=");
    assert.equal(tokens[3].value, 18);

console.log("ALGOR Lexer testi başarılı!");
});
