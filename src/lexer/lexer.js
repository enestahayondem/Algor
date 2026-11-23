
export class Lexer {
    constructor(source) {
        this.source = source;
        this.tokens = [];
        this.position = 0;
    }

    current() {
        return this.source[this.position] ?? "\0";
    }

    advance() {
        return this.source[this.position++];
    }

    tokenize() {
        while (this.position < this.source.length) {
            const char = this.current();

            // Boşlukları atla
            if (/\s/.test(char)) {
                this.advance();
                continue;
            }

            // Sayıları oku
            if (/[0-9]/.test(char)) {
                this.readNumber();
                continue;
            }

            // Kelimeleri oku
            if (/[a-zA-ZğüşöçıİĞÜŞÖÇ_]/.test(char)) {
                this.readIdentifier();
                continue;
            }

            // Tek karakterli semboller
            const symbols = {
                "=": "EQUALS",
                "+": "PLUS",
                "-": "MINUS",
                "*": "MULTIPLY",
                "/": "DIVIDE",
                "(": "LEFT_PAREN",
                ")": "RIGHT_PAREN"
            };

            if (symbols[char]) {
                this.tokens.push({
                    type: symbols[char],
                    value: this.advance()
                });
                continue;
            }

            throw new Error(`Bilinmeyen karakter: ${char}`);
        }

        this.tokens.push({
            type: "EOF",
            value: null
        });

        return this.tokens;
    }

    readNumber() {
        let number = "";

        while (/[0-9]/.test(this.current())) {
            number += this.advance();
        }

        this.tokens.push({
            type: "NUMBER",
            value: Number(number)
        });
    }

    readIdentifier() {
        let word = "";

        while (/[a-zA-ZğüşöçıİĞÜŞÖÇ_0-9]/.test(this.current())) {
            word += this.advance();
        }

        const keywords = [
            "sayi",
            "metin",
            "mantik",
            "yaz",
            "eger",
            "degilse",
            "ve",
            "veya",
            "degil"
        ];

        this.tokens.push({
            type: keywords.includes(word) ? "KEYWORD" : "IDENTIFIER",
            value: word
        });
    }
}
