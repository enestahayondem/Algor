
export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    current() {
        return this.tokens[this.position];
    }

    advance() {
        return this.tokens[this.position++];
    }

    check(type) {
        return this.current()?.type === type;
    }

    consume(type, message) {
        if (this.check(type)) {
            return this.advance();
        }

        throw new Error(
            `${message} (Bulunan: ${this.current()?.value ?? "Dosya sonu"})`
        );
    }

    parse() {
        const statements = [];

        while (!this.check("EOF")) {
            statements.push(this.statement());
        }

        return {
            type: "Program",
            statements
        };
    }

    statement() {
        const token = this.current();

        if (token.type === "KEYWORD" &&
            ["sayi", "metin", "mantik"].includes(token.value)) {
            return this.variableDeclaration();
        }

        if (token.type === "KEYWORD" && token.value === "yaz") {
            return this.printStatement();
        }

        throw new Error(`Bilinmeyen komut: ${token.value}`);
    }

    variableDeclaration() {
        const dataType = this.advance().value;

        const name = this.consume(
            "IDENTIFIER",
            "Değişken adı bekleniyordu."
        ).value;

        this.consume("EQUALS", "Değişken tanımlarken '=' bekleniyordu.");

        const value = this.expression();

        return {
            type: "VariableDeclaration",
            dataType,
            name,
            value
        };
    }

    printStatement() {
        this.advance(); // yaz

        this.consume("LEFT_PAREN", "'(' bekleniyordu.");

        const value = this.expression();

        this.consume("RIGHT_PAREN", "')' bekleniyordu.");

        return {
            type: "PrintStatement",
            value
        };
    }

    expression() {
        return this.addition();
    }

    addition() {
        let left = this.multiplication();

        while (this.check("PLUS") || this.check("MINUS")) {
            const operator = this.advance().value;
            const right = this.multiplication();

            left = {
                type: "BinaryExpression",
                operator,
                left,
                right
            };
        }

        return left;
    }

    multiplication() {
        let left = this.primary();

        while (this.check("MULTIPLY") || this.check("DIVIDE")) {
            const operator = this.advance().value;
            const right = this.primary();

            left = {
                type: "BinaryExpression",
                operator,
                left,
                right
            };
        }

        return left;
    }

    primary() {
        if (this.check("NUMBER")) {
            return {
                type: "NumberLiteral",
                value: this.advance().value
            };
        }

        if (this.check("IDENTIFIER")) {
            return {
                type: "Identifier",
                name: this.advance().value
            };
        }

        if (this.check("LEFT_PAREN")) {
            this.advance();

            const value = this.expression();

            this.consume("RIGHT_PAREN", "')' bekleniyordu.");

            return value;
        }

        throw new Error(
            `Geçersiz ifade: ${this.current()?.value ?? "Dosya sonu"}`
        );
    }
}
