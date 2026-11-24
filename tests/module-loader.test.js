import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Lexer } from "../src/lexer/lexer.js";
import { Parser } from "../src/parser/parser.js";
import { Interpreter } from "../src/runtime/interpreter.js";
import { loadProgram } from "../src/runtime/module-loader.js";

function createProject(files) {
    const directory = fs.mkdtempSync(
        path.join(os.tmpdir(), "algor-modules-")
    );

    for (const [file, content] of Object.entries(files)) {
        const filePath = path.join(directory, file);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
    }

    return directory;
}

function prepareProgram(file) {
    const source = fs.readFileSync(file, "utf8");
    const tokens = new Lexer(source).tokenize();
    const parsed = new Parser(tokens).parse();

    return loadProgram(parsed, file);
}

function executeFile(file) {
    const program = prepareProgram(file);
    const output = [];
    const originalLog = console.log;

    console.log = (...args) => output.push(args.join(" "));

    try {
        new Interpreter().run(program);
    } finally {
        console.log = originalLog;
    }

    return output;
}

test("başka dosyadan fonksiyon aktarabilmeli", () => {
    const directory = createProject({
        "matematik.algor": `
            disari fonksiyon topla(sayi a, sayi b) {
                dondur a + b
            }
        `,
        "ana.algor": `
            aktar "matematik.algor"
            yaz(topla(10, 20))
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["30"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("iç içe modül aktarımını desteklemeli", () => {
    const directory = createProject({
        "matematik.algor": `
            disari fonksiyon topla(sayi a, sayi b) {
                dondur a + b
            }
        `,
        "araclar/islem.algor": `
            aktar "../matematik.algor"

            disari fonksiyon hesapla(sayi a, sayi b) {
                dondur topla(a, b) * 2
            }
        `,
        "ana.algor": `
            aktar "araclar/islem.algor"
            yaz(hesapla(3, 4))
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["14"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("aynı modül iki kez aktarıldığında tekrar yüklememeli", () => {
    const directory = createProject({
        "matematik.algor": `
            disari fonksiyon topla(sayi a, sayi b) {
                dondur a + b
            }
        `,
        "ana.algor": `
            aktar "matematik.algor"
            aktar "matematik.algor"
            yaz(topla(4, 6))
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["10"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("bulunamayan modülde hata vermeli", () => {
    const directory = createProject({
        "ana.algor": `
            aktar "olmayan.algor"
        `
    });

    try {
        assert.throws(
            () => prepareProgram(path.join(directory, "ana.algor")),
            /Aktarılacak dosya bulunamadı/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("döngüsel modül aktarımını engellemeli", () => {
    const directory = createProject({
        "a.algor": `
            aktar "b.algor"
            disari fonksiyon a() {
                dondur 1
            }
        `,
        "b.algor": `
            aktar "a.algor"
            disari fonksiyon b() {
                dondur 2
            }
        `,
        "ana.algor": `
            aktar "a.algor"
        `
    });

    try {
        assert.throws(
            () => prepareProgram(path.join(directory, "ana.algor")),
            /Döngüsel modül aktarımı/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modüldeki dışa aktarılmamış fonksiyonu reddetmeli", () => {
    const directory = createProject({
        "gizli.algor": `
            fonksiyon gizli() {
                dondur 42
            }
        `,
        "ana.algor": `
            aktar "gizli.algor"
        `
    });

    try {
        assert.throws(
            () => prepareProgram(path.join(directory, "ana.algor")),
            /disari/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modüldeki izinsiz üst seviye komutları reddetmeli", () => {
    const directory = createProject({
        "modul.algor": `
            yaz("Merhaba")
        `,
        "ana.algor": `
            aktar "modul.algor"
        `
    });

    try {
        assert.throws(
            () => prepareProgram(path.join(directory, "ana.algor")),
            /yalnızca aktar ve disari fonksiyon/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modülden sayı, metin ve mantık değişkeni aktarabilmeli", () => {
    const directory = createProject({
        "veriler.algor": `
            disari sayi yas = 25
            disari metin isim = "ALGOR"
            disari mantik aktif = dogru
        `,
        "ana.algor": `
            aktar "veriler.algor"
            yaz(yas)
            yaz(isim)
            yaz(aktif)
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["25", "ALGOR", "true"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modülden aktarılan sabit değiştirilememeli", () => {
    const directory = createProject({
        "ayarlar.algor": `
            disari sabit sayi katsayi = 10
        `,
        "ana.algor": `
            aktar "ayarlar.algor"
            katsayi = 20
        `
    });

    try {
        assert.throws(
            () => executeFile(path.join(directory, "ana.algor")),
            /sabit olduğu için değeri değiştirilemez/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modülden dizi aktarabilmeli ve diziyi kullanabilmeli", () => {
    const directory = createProject({
        "veriler.algor": `
            disari sayi[] sayilar = [10, 20, 30]
        `,
        "ana.algor": `
            aktar "veriler.algor"
            yaz(uzunluk(sayilar))
            yaz(sayilar[1])
            ekle(sayilar, 40)
            yaz(uzunluk(sayilar))
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["3", "20", "4"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modül fonksiyonu dışa aktarılan değişkene erişebilmeli", () => {
    const directory = createProject({
        "matematik.algor": `
            disari sayi katsayi = 5

            disari fonksiyon hesapla(sayi deger) {
                dondur deger * katsayi
            }
        `,
        "ana.algor": `
            aktar "matematik.algor"
            yaz(hesapla(8))
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["40"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("farklı modüllerden aynı isimli değişken aktarılmasını engellemeli", () => {
    const directory = createProject({
        "birinci.algor": `
            disari sayi sonuc = 10
        `,
        "ikinci.algor": `
            disari sayi sonuc = 20
        `,
        "ana.algor": `
            aktar "birinci.algor"
            aktar "ikinci.algor"
            yaz(sonuc)
        `
    });

    try {
        assert.throws(
            () => executeFile(path.join(directory, "ana.algor")),
            /zaten tanımlanmış/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("farklı modüllerden aynı isimli fonksiyon aktarılmasını engellemeli", () => {
    const directory = createProject({
        "birinci.algor": `
            disari fonksiyon hesapla() {
                dondur 10
            }
        `,
        "ikinci.algor": `
            disari fonksiyon hesapla() {
                dondur 20
            }
        `,
        "ana.algor": `
            aktar "birinci.algor"
            aktar "ikinci.algor"
            yaz(hesapla())
        `
    });

    try {
        assert.throws(
            () => executeFile(path.join(directory, "ana.algor")),
            /zaten tanımlanmış/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modül fonksiyonu dışa aktarılan değişkeni güncelleyebilmeli", () => {
    const directory = createProject({
        "sayac.algor": `
            disari sayi deger = 10

            disari fonksiyon artir() {
                deger = deger + 1
                dondur deger
            }
        `,
        "ana.algor": `
            aktar "sayac.algor"
            yaz(artir())
            yaz(artir())
            yaz(deger)
        `
    });

    try {
        assert.deepEqual(
            executeFile(path.join(directory, "ana.algor")),
            ["11", "12", "12"]
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test("modül fonksiyonunun yerel değişkeni global alana sızmamalı", () => {
    const directory = createProject({
        "araclar.algor": `
            disari fonksiyon hesapla() {
                sayi gecici = 42
                dondur gecici
            }
        `,
        "ana.algor": `
            aktar "araclar.algor"
            yaz(hesapla())
            yaz(gecici)
        `
    });

    try {
        assert.throws(
            () => executeFile(path.join(directory, "ana.algor")),
            /gecici.*tanımlanmamış/
        );
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});
