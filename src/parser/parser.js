
import { AlgorError } from "../errors/algor-error.js";

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    current() {
        return this.tokens[this.position];
    }

    peek(offset = 1) {
        return this.tokens[this.position + offset];
    }

    check(type) {
        return this.current()?.type === type;
    }

    checkKeyword(value) {
        return this.check("KEYWORD") && this.current().value === value;
    }

    advance() {
        if (!this.check("EOF")) {
            this.position++;
        }
        return this.tokens[this.position - 1];
    }

    match(type) {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }

    matchKeyword(value) {
        if (this.checkKeyword(value)) {
            this.advance();
            return true;
        }
        return false;
    }

    consume(type, message) {
        if (this.check(type)) {
            return this.advance();
        }
        this.error(message);
    }

    error(message) {
        const token = this.current();
        throw new AlgorError(
            message,
            token?.line ?? null,
            token?.column ?? null
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
        const node = this.parseStatement();

        if (node && node.line == null) {
            node.line = token?.line ?? null;
            node.column = token?.column ?? null;
        }

        return node;
    }

    parseStatement() {
        if (this.checkKeyword("aktar")) {
            return this.importStatement();
        }

        if (this.checkKeyword("disari")) {
            this.advance();

            if (this.checkKeyword("fonksiyon")) {
                const declaration = this.functionDeclaration();
                return {
                    ...declaration,
                    type: "ExportFunctionDeclaration"
                };
            }

            let isConstant = false;

            if (this.checkKeyword("sabit")) {
                this.advance();
                isConstant = true;
            }

            if (
                !this.checkKeyword("sayi") &&
                !this.checkKeyword("metin") &&
                !this.checkKeyword("mantik")
            ) {
                this.error(
                    "'disari' komutundan sonra fonksiyon veya değişken tanımı bekleniyor"
                );
            }

            const declaration = this.variableDeclaration(isConstant);

            return {
                ...declaration,
                type: "ExportVariableDeclaration"
            };
        }

        if (this.checkKeyword("fonksiyon")) {
            return this.functionDeclaration();
        }
        if (this.checkKeyword("dondur")) {
            return this.returnStatement();
        }
        if (this.checkKeyword("kir")) {
            this.advance();
            return { type: "BreakStatement" };
        }
        if (this.checkKeyword("devam")) {
            this.advance();
            return { type: "ContinueStatement" };
        }
        if (this.checkKeyword("sabit")) {
            this.advance();

            if (
                !this.checkKeyword("sayi") &&
                !this.checkKeyword("metin") &&
                !this.checkKeyword("mantik")
            ) {
                this.error("sabit komutundan sonra bir tür belirtilmeli");
            }

            return this.variableDeclaration(true);
        }

        if (
            this.checkKeyword("sayi") ||
            this.checkKeyword("metin") ||
            this.checkKeyword("mantik")
        ) {
            return this.variableDeclaration(false);
        }
        if (this.checkKeyword("yaz")) {
            return this.printStatement();
        }
        if (this.checkKeyword("eger")) {
            return this.ifStatement();
        }
        if (this.checkKeyword("sec")) {
            return this.switchStatement();
        }
        if (this.checkKeyword("dongu")) {
            return this.whileStatement();
        }
        if (this.checkKeyword("her")) {
            return this.forEachStatement();
        }
        if (
            this.check("IDENTIFIER") &&
            this.peek()?.type === "LEFT_PAREN"
        ) {
            const expression = this.expression();
            this.match("SEMICOLON");
            return {
                type: "ExpressionStatement",
                expression
            };
        }
        if (
            this.check("IDENTIFIER") &&
            (
                this.peek()?.type === "EQUALS" ||
                this.peek()?.type === "LEFT_BRACKET"
            )
        ) {
            return this.assignmentStatement();
        }
        this.error("Beklenmeyen komut");
    }
    importStatement() {
        this.advance();

        const file = this.consume(
            "STRING",
            "aktar komutundan sonra dosya yolu bekleniyor"
        ).value;

        this.match("SEMICOLON");

        return {
            type: "ImportStatement",
            path: file
        };
    }

    functionDeclaration() {
        this.advance();

        const name = this.consume(
            "IDENTIFIER",
            "Fonksiyon adı bekleniyor"
        ).value;

        this.consume(
            "LEFT_PAREN",
            "Fonksiyon adından sonra '(' bekleniyor"
        );

        const parameters = [];

        if (!this.check("RIGHT_PAREN")) {
            do {
                let kind;

                if (
                    this.checkKeyword("sayi") ||
                    this.checkKeyword("metin") ||
                    this.checkKeyword("mantik")
                ) {
                    kind = this.advance().value;

                    if (this.match("LEFT_BRACKET")) {
                        this.consume(
                            "RIGHT_BRACKET",
                            "Dizi parametresinde ']' bekleniyor"
                        );
                        kind += "[]";
                    }
                } else {
                    this.error(
                        "Fonksiyon parametresinin türü belirtilmeli"
                    );
                }

                const parameterName = this.consume(
                    "IDENTIFIER",
                    "Parametre adı bekleniyor"
                ).value;

                if (parameters.some(p => p.name === parameterName)) {
                    this.error(
                        `'${parameterName}' parametresi birden fazla tanımlanamaz`
                    );
                }

                parameters.push({
                    kind,
                    name: parameterName
                });

            } while (this.match("COMMA"));
        }

        this.consume(
            "RIGHT_PAREN",
            "Fonksiyon parametrelerinde ')' eksik"
        );

        const body = this.block();

        return {
            type: "FunctionDeclaration",
            name,
            parameters,
            body
        };
    }

    returnStatement() {
        this.advance();

        if (this.check("RIGHT_BRACE") || this.check("EOF")) {
            this.error("dondur komutundan sonra bir değer bekleniyor");
        }

        const value = this.expression();
        this.match("SEMICOLON");

        return {
            type: "ReturnStatement",
            value
        };
    }

    variableDeclaration(isConstant = false) {
        let kind = this.advance().value;

        if (this.match("LEFT_BRACKET")) {
            this.consume(
                "RIGHT_BRACKET",
                "Dizi türünde ']' bekleniyor"
            );
            kind += "[]";
        }

        const name = this.consume(
            "IDENTIFIER",
            "Değişken adı bekleniyor"
        ).value;

        this.consume(
            "EQUALS",
            "Değişken tanımlarken '=' kullanmalısın"
        );

        const initializer = this.expression();

        this.match("SEMICOLON");

        return {
            type: "VariableDeclaration",
            kind,
            name,
            initializer,
            isConstant
        };
    }

    assignmentStatement() {
        const name = this.advance().value;

        if (this.match("LEFT_BRACKET")) {
            const index = this.expression();

            this.consume(
                "RIGHT_BRACKET",
                "Dizi indeksinden sonra ']' bekleniyor"
            );

            this.consume("EQUALS", "Dizi elemanı atanırken '=' bekleniyor");

            const value = this.expression();
            this.match("SEMICOLON");

            return {
                type: "ArrayAssignmentStatement",
                name,
                index,
                value
            };
        }

        this.consume("EQUALS", "'=' bekleniyor");

        const value = this.expression();

        this.match("SEMICOLON");

        return {
            type: "AssignmentStatement",
            name,
            value
        };
    }


    printStatement() {
        this.advance();

        this.consume(
            "LEFT_PAREN",
            "yaz komutundan sonra '(' bekleniyor"
        );

        const expressions = [];

        expressions.push(this.expression());

        while (this.match("COMMA")) {
            expressions.push(this.expression());
        }

        this.consume(
            "RIGHT_PAREN",
            "yaz komutunda ')' eksik"
        );

        this.match("SEMICOLON");

        return {
            type: "PrintStatement",
            expressions
        };
    }


    ifStatement() {
        this.advance();

        let condition;

        if (this.match("LEFT_PAREN")) {
            condition = this.expression();
            this.consume(
                "RIGHT_PAREN",
                "Koşuldan sonra ')' bekleniyor"
            );
        } else {
            condition = this.expression();
        }

        const thenBranch = this.block();
        let elseBranch = null;

        if (this.matchKeyword("degilse")) {
            elseBranch = this.block();
        }

        return {
            type: "IfStatement",
            condition,
            thenBranch,
            elseBranch
        };
    }

    switchStatement() {
        this.advance();

        const expression = this.expression();
        this.consume(
            "LEFT_BRACE",
            "sec komutundan sonra '{' bekleniyor"
        );

        const cases = [];
        let defaultCase = null;

        while (!this.check("RIGHT_BRACE") && !this.check("EOF")) {
            if (this.matchKeyword("durum")) {
                const value = this.expression();
                const body = this.block();

                cases.push({ value, body });
                continue;
            }

            if (this.matchKeyword("varsayilan")) {
                if (defaultCase !== null) {
                    this.error("sec içinde yalnızca bir varsayilan bloğu olabilir");
                }

                defaultCase = this.block();
                continue;
            }

            this.error("'durum' veya 'varsayilan' bekleniyor");
        }

        this.consume(
            "RIGHT_BRACE",
            "sec bloğunun sonunda '}' eksik"
        );

        if (cases.length === 0 && defaultCase === null) {
            this.error("sec bloğunda en az bir durum bulunmalı");
        }

        return {
            type: "SwitchStatement",
            expression,
            cases,
            defaultCase
        };
    }

    forEachStatement() {
        this.advance();

        const variable = this.consume(
            "IDENTIFIER",
            "her döngüsünde değişken adı bekleniyor"
        ).value;

        if (!this.checkKeyword("icinde")) {
            this.error("'icinde' anahtar kelimesi bekleniyor");
        }

        this.advance();

        const iterable = this.expression();
        const body = this.block();

        return {
            type: "ForEachStatement",
            variable,
            iterable,
            body
        };
    }

    whileStatement() {
        this.advance();

        let condition;

        if (this.match("LEFT_PAREN")) {
            condition = this.expression();
            this.consume(
                "RIGHT_PAREN",
                "Döngü koşulundan sonra ')' bekleniyor"
            );
        } else {
            condition = this.expression();
        }

        const body = this.block();

        return {
            type: "WhileStatement",
            condition,
            body
        };
    }

    block() {
        this.consume(
            "LEFT_BRACE",
            "Komut bloğu '{' ile başlamalı"
        );

        const statements = [];

        while (
            !this.check("RIGHT_BRACE") &&
            !this.check("EOF")
        ) {
            statements.push(this.statement());
        }

        this.consume(
            "RIGHT_BRACE",
            "Komut bloğunun sonunda '}' eksik"
        );

        return {
            type: "BlockStatement",
            statements
        };
    }

    expression() {
        const token = this.current();
        const node = this.logicalOr();

        if (node && node.line == null) {
            node.line = token?.line ?? null;
            node.column = token?.column ?? null;
        }

        return node;
    }

    logicalOr() {
        let expression = this.logicalAnd();

        while (this.matchKeyword("veya")) {
            expression = {
                type: "BinaryExpression",
                operator: "veya",
                left: expression,
                right: this.logicalAnd()
            };
        }

        return expression;
    }

    logicalAnd() {
        let expression = this.equality();

        while (this.matchKeyword("ve")) {
            expression = {
                type: "BinaryExpression",
                operator: "ve",
                left: expression,
                right: this.equality()
            };
        }

        return expression;
    }

    equality() {
        let expression = this.comparison();

        while (
            this.match("EQUAL_EQUAL") ||
            this.match("NOT_EQUAL")
        ) {
            const operator = this.tokens[this.position - 1].value;

            expression = {
                type: "BinaryExpression",
                operator,
                left: expression,
                right: this.comparison()
            };
        }

        return expression;
    }

    comparison() {
        let expression = this.term();

        while (
            this.match("GREATER") ||
            this.match("GREATER_EQUAL") ||
            this.match("LESS") ||
            this.match("LESS_EQUAL")
        ) {
            const operator = this.tokens[this.position - 1].value;

            expression = {
                type: "BinaryExpression",
                operator,
                left: expression,
                right: this.term()
            };
        }

        return expression;
    }

    term() {
        let expression = this.factor();

        while (
            this.match("PLUS") ||
            this.match("MINUS")
        ) {
            const operator = this.tokens[this.position - 1].value;

            expression = {
                type: "BinaryExpression",
                operator,
                left: expression,
                right: this.factor()
            };
        }

        return expression;
    }

    factor() {
        let expression = this.unary();

        while (
            this.match("MULTIPLY") ||
            this.match("DIVIDE") ||
            this.match("MODULO") ||
            this.matchKeyword("mod")
        ) {
            const operator = this.tokens[this.position - 1].value;

            expression = {
                type: "BinaryExpression",
                operator,
                left: expression,
                right: this.unary()
            };
        }

        return expression;
    }

    unary() {
        if (
            this.match("MINUS") ||
            this.matchKeyword("degil")
        ) {
            const operator = this.tokens[this.position - 1].value;

            return {
                type: "UnaryExpression",
                operator,
                right: this.unary()
            };
        }

        return this.primary();
    }

    primary() {
        if (this.match("LEFT_BRACKET")) {
            const elements = [];

            if (!this.check("RIGHT_BRACKET")) {
                do {
                    elements.push(this.expression());
                } while (this.match("COMMA"));
            }

            this.consume(
                "RIGHT_BRACKET",
                "Dizi tanımında ']' eksik"
            );

            return {
                type: "ArrayLiteral",
                elements
            };
        }

        if (this.match("NUMBER")) {
            return {
                type: "Literal",
                value: this.tokens[this.position - 1].value
            };
        }

        if (this.match("STRING")) {
            return {
                type: "Literal",
                value: this.tokens[this.position - 1].value
            };
        }

        if (this.matchKeyword("dogru")) {
            return {
                type: "Literal",
                value: true
            };
        }

        if (this.matchKeyword("yanlis")) {
            return {
                type: "Literal",
                value: false
            };
        }

        if (this.matchKeyword("oku")) {
            this.consume(
                "LEFT_PAREN",
                "oku komutundan sonra '(' bekleniyor"
            );

            let prompt = null;

            if (!this.check("RIGHT_PAREN")) {
                prompt = this.expression();
            }

            this.consume(
                "RIGHT_PAREN",
                "oku komutunda ')' eksik"
            );

            return {
                type: "InputExpression",
                prompt
            };
        }

        if (this.match("IDENTIFIER")) {
            const name = this.tokens[this.position - 1].value;
            let expression;

            if (this.match("LEFT_PAREN")) {
                const argumentsList = [];

                if (!this.check("RIGHT_PAREN")) {
                    do {
                        argumentsList.push(this.expression());
                    } while (this.match("COMMA"));
                }

                this.consume(
                    "RIGHT_PAREN",
                    "Fonksiyon çağrısında ')' eksik"
                );

                expression = {
                    type: "CallExpression",
                    name,
                    arguments: argumentsList
                };
            } else {
                expression = {
                    type: "Identifier",
                    name
                };
            }

            while (this.match("LEFT_BRACKET")) {
                const index = this.expression();

                this.consume(
                    "RIGHT_BRACKET",
                    "Dizi indeksinden sonra ']' eksik"
                );

                expression = {
                    type: "IndexExpression",
                    array: expression,
                    index
                };
            }

            return expression;
        }

        if (this.match("LEFT_PAREN")) {
            const expression = this.expression();

            this.consume(
                "RIGHT_PAREN",
                "Parantez kapatılmamış"
            );

            return expression;
        }

        this.error("Geçersiz ifade");
    }
}
