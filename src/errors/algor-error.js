
export class AlgorError extends Error {
    constructor(message, line = null, column = null) {
        super(message);

        this.name = "AlgorError";
        this.line = line;
        this.column = column;
    }

    format(filename = "program.algor") {
        if (this.line === null) {
            return `ALGOR Hatası:\n${this.message}`;
        }

        return `ALGOR Hatası:\n${filename}:${this.line}:${this.column}\n${this.message}`;
    }
}
