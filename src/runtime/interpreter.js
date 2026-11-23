
export class Interpreter {
    constructor() {
        this.variables = new Map();
    }

    run(program) {
        for (const statement of program.statements) {
            this.execute(statement);
        }
    }

    execute(statement) {
        switch (statement.type) {
            case "VariableDeclaration":
                this.variableDeclaration(statement);
                break;

            case "PrintStatement":
                this.printStatement(statement);
                break;

            default:
                throw new Error(
                    `Bilinmeyen komut türü: ${statement.type}`
                );
        }
    }

    variableDeclaration(statement) {
        const value = this.evaluate(statement.value);

        if (statement.dataType === "sayi" && typeof value !== "number") {
            throw new Error("sayi değişkenine sayı atanmalıdır.");
        }

        if (statement.dataType === "metin" && typeof value !== "string") {
            throw new Error("metin değişkenine metin atanmalıdır.");
        }

        if (statement.dataType === "mantik" && typeof value !== "boolean") {
            throw new Error("mantik değişkenine doğru veya yanlış atanmalıdır.");
        }

        this.variables.set(statement.name, value);
    }

    printStatement(statement) {
        const value = this.evaluate(statement.value);
        console.log(value);
    }

    evaluate(expression) {
        switch (expression.type) {
            case "NumberLiteral":
                return expression.value;

            case "Identifier":
                if (!this.variables.has(expression.name)) {
                    throw new Error(
                        `Tanımlanmamış değişken: ${expression.name}`
                    );
                }

                return this.variables.get(expression.name);

            case "BinaryExpression":
                return this.evaluateBinary(expression);

            default:
                throw new Error(
                    `Bilinmeyen ifade: ${expression.type}`
                );
        }
    }

    evaluateBinary(expression) {
        const left = this.evaluate(expression.left);
        const right = this.evaluate(expression.right);

        switch (expression.operator) {
            case "+":
                return left + right;

            case "-":
                return left - right;

            case "*":
                return left * right;

            case "/":
                if (right === 0) {
                    throw new Error("Sıfıra bölme yapılamaz.");
                }

                return left / right;

            default:
                throw new Error(
                    `Bilinmeyen operatör: ${expression.operator}`
                );
        }
    }
}
