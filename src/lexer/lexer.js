
import { AlgorError } from "../errors/algor-error.js";

export class Lexer {
    constructor(source) {
        this.source = source;
        this.tokens = [];
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }

    current(offset = 0) {
        return this.source[this.position + offset] ?? "\0";
    }

    advance() {
        const char = this.source[this.position++];

        if (char === "\n") {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }

        return char;
    }

    addToken(type, value, line = this.line, column = this.column) {
        this.tokens.push({
            type,
            value,
            line,
            column
        });
    }

    tokenize() {
        while (this.position < this.source.length) {
            const char = this.current();

            if (/\s/.test(char)) {
                this.advance();
                continue;
            }

            // Tek satırlık yorum
            if (char === "/" && this.current(1) === "/") {
                while (
                    this.current() !== "\n" &&
                    this.current() !== "\0"
                ) {
                    this.advance();
                }
                continue;
            }

            const line = this.line;
            const column = this.column;

            if (/[0-9]/.test(char)) {
                this.readNumber();
                continue;
            }

            if (/[a-zA-ZğüşöçıİĞÜŞÖÇ_]/.test(char)) {
                this.readIdentifier();
                continue;
            }

            if (char === '"' || char === "'") {
                this.readString();
                continue;
            }

            // İki karakterli operatörler
            const doubleOperators = {
                "==": "EQUAL_EQUAL",
                "!=": "NOT_EQUAL",
                ">=": "GREATER_EQUAL",
                "<=": "LESS_EQUAL"
            };

            const pair = char + this.current(1);

            if (doubleOperators[pair]) {
                this.advance();
                this.advance();

                this.addToken(
                    doubleOperators[pair],
                    pair,
                    line,
                    column
                );

                continue;
            }

            // Tek karakterli semboller
            const symbols = {
                "=": "EQUALS",
                "+": "PLUS",
                "-": "MINUS",
                "*": "MULTIPLY",
                "/": "DIVIDE",
                "%": "MODULO",
                ">": "GREATER",
                "<": "LESS",
                "(": "LEFT_PAREN",
                ")": "RIGHT_PAREN",
                "{": "LEFT_BRACE",
                "}": "RIGHT_BRACE",
                ";": "SEMICOLON",
                ",": "COMMA",
                "[": "LEFT_BRACKET",
                "]": "RIGHT_BRACKET"
            };

            if (symbols[char]) {
                this.advance();

                this.addToken(
                    symbols[char],
                    char,
                    line,
                    column
                );

                continue;
            }

            throw new AlgorError(
                `Tanınmayan karakter: ${char}`,
                line,
                column
            );
        }

        this.addToken("EOF", null);

        return this.tokens;
    }

    readNumber() {
        const line = this.line;
        const column = this.column;

        let number = "";

        while (/[0-9]/.test(this.current())) {
            number += this.advance();
        }

        // Ondalıklı sayı desteği
        if (
            this.current() === "." &&
            /[0-9]/.test(this.current(1))
        ) {
            number += this.advance();

            while (/[0-9]/.test(this.current())) {
                number += this.advance();
            }
        }

        this.addToken(
            "NUMBER",
            Number(number),
            line,
            column
        );
    }

    readIdentifier() {
        const line = this.line;
        const column = this.column;

        let word = "";

        while (/[a-zA-ZğüşöçıİĞÜŞÖÇ_0-9]/.test(this.current())) {
            word += this.advance();
        }

        const keywords = [
            "sabit",
            "sayi",
            "metin",
            "mantik",
            "yaz",
            "oku",
            "eger",
            "degilse",
            "dongu",
            "her",
            "icinde",
            "kir",
            "devam",
            "ve",
            "veya",
            "degil",
            "dogru",
            "yanlis",
            "fonksiyon",
            "dondur",
            "mod",
            "sec",
            "durum",
            "varsayilan",
            "aktar",
            "disari"
        ];

        this.addToken(
            keywords.includes(word) ? "KEYWORD" : "IDENTIFIER",
            word,
            line,
            column
        );
    }

    readString() {
        const line = this.line;
        const column = this.column;

        const quote = this.advance();

        let value = "";

        while (
            this.current() !== quote &&
            this.current() !== "\0"
        ) {
            if (this.current() === "\n") {
                throw new AlgorError(
                    "Metin içerisinde beklenmeyen satır sonu",
                    this.line,
                    this.column
                );
            }

            if (this.current() === "\\") {
                this.advance();

                const escaped = this.advance();

                const escapeCharacters = {
                    "n": "\n",
                    "t": "\t",
                    "r": "\r",
                    "\\": "\\",
                    '"': '"',
                    "'": "'"
                };

                if (!(escaped in escapeCharacters)) {
                    throw new AlgorError(
                        `Geçersiz kaçış karakteri: \\${escaped}`,
                        this.line,
                        this.column
                    );
                }

                value += escapeCharacters[escaped];

                continue;
            }

            value += this.advance();
        }

        if (this.current() === "\0") {
            throw new AlgorError(
                "Kapatılmamış metin ifadesi",
                line,
                column
            );
        }

        this.advance();

        this.addToken(
            "STRING",
            value,
            line,
            column
        );
    }
}
