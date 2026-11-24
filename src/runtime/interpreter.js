
import { AlgorError } from "../errors/algor-error.js";
import fs from "node:fs";

class ReturnSignal {
    constructor(value) {
        this.value = value;
    }
}

class BreakSignal {}

class ContinueSignal {}

export class Interpreter {
    constructor(input = null) {
        this.variables = new Map();

        this.globalEnvironment = {
            values: this.variables,
            parent: null
        };

        this.environment = this.globalEnvironment;
        this.functions = new Map();

        this.maxLoopIterations = 10000;
        this.maxCallDepth = 500;
        this.callDepth = 0;
        this.loopDepth = 0;

        this.input = input || this.readInput.bind(this);
    }

    readInput() {
        const buffer = Buffer.alloc(1);
        const bytes = [];

        while (true) {
            const count = fs.readSync(0, buffer, 0, 1, null);

            if (count === 0 || buffer[0] === 10) {
                break;
            }

            bytes.push(buffer[0]);
        }

        if (bytes.at(-1) === 13) {
            bytes.pop();
        }

        return Buffer.from(bytes).toString("utf8");
    }

    run(program) {
        this.executeBlock(program.statements);
    }

    executeBlock(statements) {
        for (const statement of statements) {
            this.execute(statement);
        }
    }

    attachLocation(error, node) {
        if (
            error instanceof AlgorError &&
            error.line == null &&
            node?.line != null
        ) {
            error.line = node.line;
            error.column = node.column ?? null;
        }
    }

    execute(node) {
        try {
            this.executeNode(node);
        } catch (error) {
            this.attachLocation(error, node);
            throw error;
        }
    }

    executeNode(node) {
        switch (node.type) {
            case "FunctionDeclaration":
            case "ExportFunctionDeclaration":
                this.functionDeclaration(node);
                break;

            case "ReturnStatement":
                if (this.callDepth === 0) {
                    throw new AlgorError(
                        "dondur komutu yalnızca fonksiyon içinde kullanılabilir"
                    );
                }

                throw new ReturnSignal(this.evaluate(node.value));

            case "BreakStatement":
                if (this.loopDepth === 0) {
                    throw new AlgorError(
                        "kir komutu yalnızca döngü içinde kullanılabilir"
                    );
                }
                throw new BreakSignal();

            case "ContinueStatement":
                if (this.loopDepth === 0) {
                    throw new AlgorError(
                        "devam komutu yalnızca döngü içinde kullanılabilir"
                    );
                }
                throw new ContinueSignal();

            case "ExpressionStatement":
                this.evaluate(node.expression);
                break;
            case "VariableDeclaration":
                this.variableDeclaration(node);
                break;

            case "AssignmentStatement":
                this.assignmentStatement(node);
                break;

            case "ArrayAssignmentStatement":
                this.arrayAssignmentStatement(node);
                break;

            case "PrintStatement":
                this.printStatement(node);
                break;

            case "IfStatement":
                this.ifStatement(node);
                break;

            case "SwitchStatement":
                this.switchStatement(node);
                break;

            case "WhileStatement":
                this.whileStatement(node);
                break;
            case "ForEachStatement":
                this.forEachStatement(node);
                break;

            case "BlockStatement":
                this.executeBlock(node.statements);
                break;

            default:
                throw new AlgorError(`Bilinmeyen komut: ${node.type}`);
        }
    }

    functionDeclaration(node) {
        if (this.functions.has(node.name)) {
            throw new AlgorError(
                `'${node.name}' fonksiyonu zaten tanımlanmış`
            );
        }

        this.functions.set(node.name, node);
    }

    variableDeclaration(node) {
        if (this.environment.values.has(node.name)) {
            throw new AlgorError(
                `'${node.name}' değişkeni zaten tanımlanmış`
            );
        }

        let value = this.evaluate(node.initializer);

        if (node.initializer.type === "InputExpression") {
            value = this.convertInput(node.kind, value);
        }

        this.checkType(node.kind, value);

        if (node.isConstant && Array.isArray(value)) {
            Object.freeze(value);
        }

        this.environment.values.set(node.name, {
            kind: node.kind,
            value,
            constant: Boolean(node.isConstant)
        });
    }

    assignmentStatement(node) {
        let scope = this.environment;

        while (scope && !scope.values.has(node.name)) {
            scope = scope.parent;
        }

        if (!scope) {
            throw new AlgorError(
                `'${node.name}' değişkeni tanımlanmamış`
            );
        }

        const variable = scope.values.get(node.name);

        if (variable.constant) {
            throw new AlgorError(
                `'${node.name}' sabit olduğu için değeri değiştirilemez`
            );
        }

        let value = this.evaluate(node.value);

        if (node.value.type === "InputExpression") {
            value = this.convertInput(variable.kind, value);
        }

        this.checkType(variable.kind, value);

        variable.value = value;
    }

    arrayAssignmentStatement(node) {
        const variable = this.findVariable(node.name);

        if (!variable) {
            throw new AlgorError(
                `'${node.name}' değişkeni tanımlanmamış`
            );
        }

        if (!Array.isArray(variable.value)) {
            throw new AlgorError(
                `'${node.name}' bir dizi değil`
            );
        }

        if (variable.constant || Object.isFrozen(variable.value)) {
            throw new AlgorError(
                `'${node.name}' sabit olduğu için değiştirilemez`
            );
        }

        const index = this.evaluate(node.index);

        this.checkArrayIndex(index, variable.value.length);

        const value = this.evaluate(node.value);
        const elementKind = variable.kind.replace("[]", "");

        this.checkType(elementKind, value);

        variable.value[index] = value;
    }

    findVariable(name) {
        let scope = this.environment;

        while (scope) {
            if (scope.values.has(name)) {
                return scope.values.get(name);
            }

            scope = scope.parent;
        }

        return null;
    }

    checkArrayIndex(index, length) {
        if (
            typeof index !== "number" ||
            !Number.isInteger(index)
        ) {
            throw new AlgorError(
                "Dizi indeksi tam sayı olmalı"
            );
        }

        if (index < 0 || index >= length) {
            throw new AlgorError(
                `Dizi indeksi sınır dışında: ${index}`
            );
        }
    }

    convertInput(kind, value) {
        if (kind === "metin") {
            return value;
        }

        if (kind === "sayi") {
            const number = Number(value);

            if (value.trim() === "" || !Number.isFinite(number)) {
                throw new AlgorError(
                    "Geçerli bir sayı girmelisin"
                );
            }

            return number;
        }

        if (kind === "mantik") {
            const normalized = value.trim().toLowerCase();

            if (normalized === "dogru") {
                return true;
            }

            if (normalized === "yanlis") {
                return false;
            }

            throw new AlgorError(
                "Mantık değeri için 'dogru' veya 'yanlis' girmelisin"
            );
        }

        return value;
    }

    checkType(kind, value) {
        if (kind.endsWith("[]")) {
            const elementKind = kind.slice(0, -2);

            if (
                !Array.isArray(value) ||
                !value.every(item => this.isValidType(elementKind, item))
            ) {
                throw new AlgorError(
                    `'${kind}' türündeki değişkene uyumsuz dizi atanamaz`
                );
            }

            return;
        }

        if (!this.isValidType(kind, value)) {
            throw new AlgorError(
                `'${kind}' türündeki değişkene uyumsuz değer atanamaz`
            );
        }
    }

    isValidType(kind, value) {
        return (
            (kind === "sayi" && typeof value === "number") ||
            (kind === "metin" && typeof value === "string") ||
            (kind === "mantik" && typeof value === "boolean")
        );
    }

    printStatement(node) {
        const values = node.expressions.map(expression =>
            this.evaluate(expression)
        );

        console.log(...values);
    }

    ifStatement(node) {
        const condition = this.evaluate(node.condition);

        if (typeof condition !== "boolean") {
            throw new AlgorError(
                "Eğer koşulu mantıksal değer olmalı"
            );
        }

        if (condition) {
            this.executeBlock(node.thenBranch.statements);
        } else if (node.elseBranch) {
            this.executeBlock(node.elseBranch.statements);
        }
    }

    switchStatement(node) {
        const value = this.evaluate(node.expression);

        for (const item of node.cases) {
            const caseValue = this.evaluate(item.value);

            if (value === caseValue) {
                this.executeBlock(item.body.statements);
                return;
            }
        }

        if (node.defaultCase) {
            this.executeBlock(node.defaultCase.statements);
        }
    }

    forEachStatement(node) {
        const values = this.evaluate(node.iterable);

        if (!Array.isArray(values)) {
            throw new AlgorError(
                "her döngüsü yalnızca diziler üzerinde kullanılabilir"
            );
        }

        if (values.length === 0) {
            return;
        }

        let kind;

        if (typeof values[0] === "number") {
            kind = "sayi";
        } else if (typeof values[0] === "string") {
            kind = "metin";
        } else if (typeof values[0] === "boolean") {
            kind = "mantik";
        } else {
            throw new AlgorError(
                "her döngüsünde desteklenmeyen dizi türü"
            );
        }

        const previousEnvironment = this.environment;
        const loopEnvironment = {
            values: new Map(),
            parent: previousEnvironment
        };

        this.environment = loopEnvironment;
        this.loopDepth++;

        try {
            let iterations = 0;

            for (const value of values) {
                if (iterations >= this.maxLoopIterations) {
                    throw new AlgorError(
                        "Döngü güvenlik sınırını aştı"
                    );
                }

                loopEnvironment.values.set(node.variable, {
                    kind,
                    value
                });

                try {
                    this.executeBlock(node.body.statements);
                } catch (error) {
                    if (error instanceof BreakSignal) {
                        break;
                    }

                    if (!(error instanceof ContinueSignal)) {
                        throw error;
                    }
                }

                iterations++;
            }
        } finally {
            this.loopDepth--;
            this.environment = previousEnvironment;
        }
    }

    whileStatement(node) {
        let iterations = 0;
        this.loopDepth++;

        try {
            while (true) {
                const condition = this.evaluate(node.condition);

                if (typeof condition !== "boolean") {
                    throw new AlgorError(
                        "dongu koşulu mantıksal değer olmalı"
                    );
                }

                if (!condition) {
                    break;
                }

                if (iterations >= this.maxLoopIterations) {
                    throw new AlgorError(
                        "Döngü güvenlik sınırını aştı"
                    );
                }

                try {
                    this.executeBlock(node.body.statements);
                } catch (error) {
                    if (error instanceof BreakSignal) {
                        break;
                    }

                    if (!(error instanceof ContinueSignal)) {
                        throw error;
                    }
                }

                iterations++;
            }
        } finally {
            this.loopDepth--;
        }
    }

    evaluate(node) {
        try {
            return this.evaluateNode(node);
        } catch (error) {
            this.attachLocation(error, node);
            throw error;
        }
    }

    evaluateNode(node) {
        switch (node.type) {
            case "Literal":
                return node.value;

            case "Identifier":
                return this.getVariable(node.name);

            case "ArrayLiteral":
                return node.elements.map(element =>
                    this.evaluate(element)
                );

            case "IndexExpression": {
                const array = this.evaluate(node.array);

                if (!Array.isArray(array)) {
                    throw new AlgorError(
                        "İndeksleme işlemi bir dizi gerektiriyor"
                    );
                }

                const index = this.evaluate(node.index);
                this.checkArrayIndex(index, array.length);

                return array[index];
            }

            case "InputExpression":
                return this.inputExpression(node);

            case "CallExpression":
                return this.callFunction(node);

            case "UnaryExpression":
                return this.evaluateUnary(node);

            case "BinaryExpression":
                return this.evaluateBinary(node);

            default:
                throw new AlgorError(
                    `Bilinmeyen ifade: ${node.type}`
                );
        }
    }

    inputExpression(node) {
        if (node.prompt !== null) {
            const prompt = this.evaluate(node.prompt);

            if (typeof prompt !== "string") {
                throw new AlgorError(
                    "oku() mesajı metin olmalı"
                );
            }

            process.stdout.write(prompt);
        }

        return this.input();
    }

    getVariable(name) {
        let scope = this.environment;

        while (scope) {
            if (scope.values.has(name)) {
                return scope.values.get(name).value;
            }

            scope = scope.parent;
        }

        throw new AlgorError(
            `'${name}' değişkeni tanımlanmamış`
        );
    }

    callFunction(node) {
        const fn = this.functions.get(node.name);

        if (!fn && ["uzunluk", "ekle", "sil", "aralik", "rastgele"].includes(node.name)) {
            return this.callBuiltin(node);
        }

        if (!fn) {
            throw new AlgorError(
                `'${node.name}' fonksiyonu tanımlanmamış`
            );
        }

        if (node.arguments.length !== fn.parameters.length) {
            throw new AlgorError(
                `'${node.name}' fonksiyonu ${fn.parameters.length} parametre bekliyor, ${node.arguments.length} parametre gönderildi`
            );
        }

        if (this.callDepth >= this.maxCallDepth) {
            throw new AlgorError(
                "Fonksiyon çağrısı güvenlik sınırını aştı"
            );
        }

        const values = node.arguments.map(argument =>
            this.evaluate(argument)
        );

        const localEnvironment = {
            values: new Map(),
            parent: this.globalEnvironment
        };

        for (let i = 0; i < fn.parameters.length; i++) {
            const parameter = fn.parameters[i];
            const value = values[i];
            this.checkType(parameter.kind, value);
            localEnvironment.values.set(parameter.name, {
                kind: parameter.kind,
                value
            });
        }

        const previousEnvironment = this.environment;
        const previousLoopDepth = this.loopDepth;

        this.environment = localEnvironment;
        this.loopDepth = 0;
        this.callDepth++;

        try {
            this.executeBlock(fn.body.statements);
            return null;
        } catch (error) {
            if (error instanceof ReturnSignal) {
                return error.value;
            }
            throw error;
        } finally {
            this.environment = previousEnvironment;
            this.loopDepth = previousLoopDepth;
            this.callDepth--;
        }
    }

    callBuiltin(node) {
        const args = node.arguments.map(argument =>
            this.evaluate(argument)
        );

        if (node.name === "uzunluk") {
            if (args.length !== 1) {
                throw new AlgorError(
                    "uzunluk() bir parametre bekliyor"
                );
            }

            if (!Array.isArray(args[0])) {
                throw new AlgorError(
                    "uzunluk() bir dizi bekliyor"
                );
            }

            return args[0].length;
        }

        if (node.name === "ekle") {
            if (args.length !== 2) {
                throw new AlgorError(
                    "ekle() iki parametre bekliyor"
                );
            }

            const [array, value] = args;

            if (!Array.isArray(array)) {
                throw new AlgorError(
                    "ekle() ilk parametre olarak bir dizi bekliyor"
                );
            }

            const variable = this.findArrayVariable(array);

            if (!variable) {
                throw new AlgorError(
                    "ekle() tanımlanmış bir dizi değişkeni bekliyor"
                );
            }

            if (variable.constant || Object.isFrozen(array)) {
                throw new AlgorError(
                    "Sabit diziye eleman eklenemez"
                );
            }

            const elementKind = variable.kind.replace("[]", "");
            this.checkType(elementKind, value);

            array.push(value);
            return null;
        }

        if (node.name === "sil") {
            if (args.length !== 2) {
                throw new AlgorError(
                    "sil() iki parametre bekliyor"
                );
            }

            const [array, index] = args;

            if (!Array.isArray(array)) {
                throw new AlgorError(
                    "sil() ilk parametre olarak bir dizi bekliyor"
                );
            }

            this.checkArrayIndex(index, array.length);

            if (Object.isFrozen(array)) {
                throw new AlgorError(
                    "Sabit diziden eleman silinemez"
                );
            }

            return array.splice(index, 1)[0];
        }

        if (node.name === "aralik") {
            if (args.length !== 2 && args.length !== 3) {
                throw new AlgorError(
                    "aralik() iki veya üç parametre bekliyor"
                );
            }

            const [start, end, suppliedStep] = args;
            const step = suppliedStep === undefined ? (start <= end ? 1 : -1) : suppliedStep;

            if (
                !Number.isSafeInteger(start) ||
                !Number.isSafeInteger(end) ||
                !Number.isSafeInteger(step)
            ) {
                throw new AlgorError(
                    "aralik() tam sayı parametreleri bekliyor"
                );
            }

            if (step === 0) {
                throw new AlgorError(
                    "aralik() adımı sıfır olamaz"
                );
            }

            if (start < end && step < 0 || start > end && step > 0) {
                throw new AlgorError(
                    "aralik() adımı belirtilen yönde ilerlemeli"
                );
            }

            const result = [];

            for (
                let value = start;
                step > 0 ? value <= end : value >= end;
                value += step
            ) {
                if (result.length >= this.maxLoopIterations) {
                    throw new AlgorError(
                        "aralik() en fazla 10000 eleman üretebilir"
                    );
                }

                result.push(value);
            }

            return result;
        }

        if (node.name === "rastgele") {
            if (args.length !== 2) {
                throw new AlgorError(
                    "rastgele() iki parametre bekliyor"
                );
            }

            const [min, max] = args;

            if (
                !Number.isSafeInteger(min) ||
                !Number.isSafeInteger(max)
            ) {
                throw new AlgorError(
                    "rastgele() tam sayı parametreleri bekliyor"
                );
            }

            if (min > max) {
                throw new AlgorError(
                    "rastgele() için ilk değer ikinci değerden büyük olamaz"
                );
            }

            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }

    findArrayVariable(array) {
        let scope = this.environment;

        while (scope) {
            for (const variable of scope.values.values()) {
                if (variable.value === array) {
                    return variable;
                }
            }

            scope = scope.parent;
        }

        return null;
    }

    evaluateUnary(node) {
        const value = this.evaluate(node.right);

        if (node.operator === "-") {
            if (typeof value !== "number") {
                throw new AlgorError(
                    "Eksi operatörü sayı bekliyor"
                );
            }

            return -value;
        }

        if (node.operator === "degil") {
            if (typeof value !== "boolean") {
                throw new AlgorError(
                    "'degil' operatörü mantık bekliyor"
                );
            }

            return !value;
        }

        throw new AlgorError(
            `Bilinmeyen tekli operatör: ${node.operator}`
        );
    }

    evaluateBinary(node) {
        const left = this.evaluate(node.left);

        if (node.operator === "ve" || node.operator === "veya") {
            if (typeof left !== "boolean") {
                throw new AlgorError(
                    "Mantıksal işlemlerde boolean değer kullanılmalı"
                );
            }

            if (node.operator === "ve" && !left) {
                return false;
            }

            if (node.operator === "veya" && left) {
                return true;
            }

            const right = this.evaluate(node.right);

            if (typeof right !== "boolean") {
                throw new AlgorError(
                    "Mantıksal işlemlerde boolean değer kullanılmalı"
                );
            }

            return node.operator === "ve"
                ? left && right
                : left || right;
        }

        const right = this.evaluate(node.right);

        switch (node.operator) {
            case "+":
                if (
                    typeof left === "string" &&
                    typeof right === "string"
                ) {
                    return left + right;
                }

                this.checkNumbers(left, right);
                return left + right;

            case "-":
                this.checkNumbers(left, right);
                return left - right;

            case "*":
                this.checkNumbers(left, right);
                return left * right;

            case "/":
                this.checkNumbers(left, right);

                if (right === 0) {
                    throw new AlgorError("Sıfıra bölme hatası");
                }

                return left / right;

            case "mod":
            case "%":
                this.checkNumbers(left, right);

                if (right === 0) {
                    throw new AlgorError("Mod alma işleminde bölen sıfır olamaz");
                }

                return left % right;

            case "==":
                return left === right;

            case "!=":
                return left !== right;

            case ">":
                this.checkNumbers(left, right);
                return left > right;

            case "<":
                this.checkNumbers(left, right);
                return left < right;

            case ">=":
                this.checkNumbers(left, right);
                return left >= right;

            case "<=":
                this.checkNumbers(left, right);
                return left <= right;

             default:
                throw new AlgorError(
                    `Bilinmeyen operatör: ${node.operator}`
                );
        }
    }

    checkNumbers(left, right) {
        if (
            typeof left !== "number" ||
            typeof right !== "number"
        ) {
            throw new AlgorError(
                "Bu işlem sayı değerleri gerektiriyor"
            );
        }
    }

    checkBooleans(left, right) {
        if (
            typeof left !== "boolean" ||
            typeof right !== "boolean"
        ) {
            throw new AlgorError(
                "Mantıksal işlem boolean değerleri gerektiriyor"
            );
        }
    }
}
