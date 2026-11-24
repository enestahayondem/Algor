
import { test } from "node:test";
import assert from "node:assert/strict";

import { Lexer } from "../src/lexer/lexer.js";
import { Parser } from "../src/parser/parser.js";
import { Interpreter } from "../src/runtime/interpreter.js";

function run(source, inputValues = []) {
    const tokens = new Lexer(source).tokenize();
    const program = new Parser(tokens).parse();

    const inputs = [...inputValues];
    const interpreter = new Interpreter(
        () => inputs.shift() ?? ""
    );

    const output = [];
    const originalLog = console.log;
    const originalWrite = process.stdout.write;

    console.log = (...args) => {
        output.push(args.join(" "));
    };

    process.stdout.write = (text) => {
        output.push(String(text));
        return true;
    };

    try {
        interpreter.run(program);
    } finally {
        console.log = originalLog;
        process.stdout.write = originalWrite;
    }

    return output;
}

test("Sayı değişkenini yazdırmalı", () => {
    assert.deepEqual(
        run("sayi yas = 18 yaz(yas)"),
        ["18"]
    );
});

test("Metinleri birleştirmeli", () => {
    assert.deepEqual(
        run('metin isim = "Enes" yaz("Merhaba " + isim)'),
        ["Merhaba Enes"]
    );
});

test("Koşul doğruysa çalışmalı", () => {
    assert.deepEqual(
        run(`
            sayi yas = 18
            eger yas >= 18 {
                yaz("Reşit")
            } degilse {
                yaz("Değil")
            }
        `),
        ["Reşit"]
    );
});

test("Döngü beş kez çalışmalı", () => {
    assert.deepEqual(
        run(`
            sayi i = 1
            dongu i <= 5 {
                yaz(i)
                i = i + 1
            }
        `),
        ["1", "2", "3", "4", "5"]
    );
});

test("Mantıksal işlemleri yapmalı", () => {
    assert.deepEqual(
        run(`
            mantik sonuc = dogru ve degil yanlis
            yaz(sonuc)
        `),
        ["true"]
    );
});

test("Sıfıra bölme hatası vermeli", () => {
    assert.throws(
        () => run("sayi sonuc = 10 / 0"),
        /Sıfıra bölme hatası/
    );
});

test("oku() metin girdisi almalı", () => {
    assert.deepEqual(
        run(
            'metin isim = oku("Adın ne? ") yaz(isim)',
            ["Enes"]
        ),
        ["Adın ne? ", "Enes"]
    );
});

test("oku() sayısal girdiyi sayıya dönüştürmeli", () => {
    assert.deepEqual(
        run(
            "sayi yas = oku() yaz(yas + 2)",
            ["18"]
        ),
        ["20"]
    );
});

test("oku() geçersiz sayı girişini reddetmeli", () => {
    assert.throws(
        () => run("sayi yas = oku()", ["abc"]),
        /Geçerli bir sayı girmelisin/
    );
});
test("Birden fazla argümanı yazdırmalı", () => {
    assert.deepEqual(
        run(`
            metin isim = "Enes"
            sayi yas = 18
            yaz("Merhaba", isim)
            yaz("Yaşın:", yas)
            yaz("Bilgilerin:", isim, yas)
        `),
        [
            "Merhaba Enes",
            "Yaşın: 18",
            "Bilgilerin: Enes 18"
        ]
    );
});

test("Tek argümanlı yaz() çalışmaya devam etmeli", () => {
    assert.deepEqual(
        run('yaz("Merhaba")'),
        ["Merhaba"]
    );
});

test("Birden fazla argümanda matematiksel ifade kullanmalı", () => {
    assert.deepEqual(
        run(`
            sayi yas = 18
            yaz("Yeni yaş:", yas + 5)
        `),
        ["Yeni yaş: 23"]
    );
});

test("Fonksiyon tanımlayıp değer döndürmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon topla(sayi a, sayi b) {
                dondur a + b
            }

            sayi sonuc = topla(10, 20)
            yaz(sonuc)
        `),
        ["30"]
    );
});

test("Fonksiyon metin parametresi alabilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon selamla(metin isim) {
                dondur "Merhaba " + isim
            }

            yaz(selamla("Enes"))
        `),
        ["Merhaba Enes"]
    );
});

test("Fonksiyon mantıksal değer döndürebilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon yetiskinMi(sayi yas) {
                dondur yas >= 18
            }

            yaz(yetiskinMi(20))
        `),
        ["true"]
    );
});

test("Fonksiyonlar iç içe çağrılabilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon ikiyleCarp(sayi x) {
                dondur x * 2
            }

            fonksiyon ekle(sayi x) {
                dondur ikiyleCarp(x) + 5
            }

            yaz(ekle(10))
        `),
        ["25"]
    );
});

test("Özyinelemeli fonksiyon çalışmalı", () => {
    assert.deepEqual(
        run(`
            fonksiyon faktoriyel(sayi n) {
                eger n <= 1 {
                    dondur 1
                }

                dondur n * faktoriyel(n - 1)
            }

            yaz(faktoriyel(5))
        `),
        ["120"]
    );
});

test("Fonksiyon yerel değişkenleri global değişkenleri gölgeleyebilmeli", () => {
    assert.deepEqual(
        run(`
            sayi sayiDeger = 10

            fonksiyon hesapla() {
                sayi sayiDeger = 50
                dondur sayiDeger
            }

            yaz(hesapla())
            yaz(sayiDeger)
        `),
        ["50", "10"]
    );
});

test("Fonksiyon parametre sayısı kontrol edilmeli", () => {
    assert.throws(
        () => run(`
            fonksiyon topla(sayi a, sayi b) {
                dondur a + b
            }

            yaz(topla(5))
        `),
        /parametre bekliyor/
    );
});

test("Fonksiyon parametre türü kontrol edilmeli", () => {
    assert.throws(
        () => run(`
            fonksiyon topla(sayi a) {
                dondur a
            }

            yaz(topla("metin"))
        `),
        /uyumsuz değer/
    );
});

test("Tanımsız fonksiyon çağrısında hata vermeli", () => {
    assert.throws(
        () => run("yaz(olmayanFonksiyon(5))"),
        /fonksiyonu tanımlanmamış/
    );
});

test("Fonksiyon dışında dondur kullanılamamalı", () => {
    assert.throws(
        () => run("dondur 10"),
        /yalnızca fonksiyon içinde/
    );
});


// ALGOR 0.3.0 - Dizi testleri

test("Sayı dizisi tanımlamalı ve elemanlarına erişmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] notlar = [80, 90, 100]
            yaz(notlar[0])
            yaz(notlar[1])
            yaz(notlar[2])
        `),
        ["80", "90", "100"]
    );
});

test("Dizi elemanını değiştirebilmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] notlar = [80, 90, 100]
            notlar[2] = 95
            yaz(notlar[2])
        `),
        ["95"]
    );
});

test("Metin dizisi kullanabilmeli", () => {
    assert.deepEqual(
        run(`
            metin[] isimler = ["Ali", "Ayşe"]
            yaz(isimler[0])
            yaz(isimler[1])
        `),
        ["Ali", "Ayşe"]
    );
});

test("Mantık dizisi kullanabilmeli", () => {
    assert.deepEqual(
        run(`
            mantik[] durumlar = [dogru, yanlis]
            yaz(durumlar[0])
            yaz(durumlar[1])
        `),
        ["true", "false"]
    );
});

test("Dizi elemanları matematiksel işlemlerde kullanılabilmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [10, 20, 30]
            yaz(sayilar[0] + sayilar[1])
        `),
        ["30"]
    );
});

test("Diziye yanlış türde değer atanamamalı", () => {
    assert.throws(
        () => run(`
            sayi[] sayilar = [10, 20]
            sayilar[0] = "Enes"
        `),
        /uyumsuz değer/
    );
});

test("Dizi sınırları kontrol edilmeli", () => {
    assert.throws(
        () => run(`
            sayi[] sayilar = [10, 20]
            yaz(sayilar[5])
        `),
        /Dizi indeksi sınır dışında/
    );
});

test("Boş dizi tanımlanabilmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = []
            yaz(sayilar)
        `),
        [""]
    );
});


// ALGOR 0.3.0 - Dizi standart fonksiyonları

test("uzunluk() dizinin eleman sayısını vermeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [10, 20, 30]
            yaz(uzunluk(sayilar))
        `),
        ["3"]
    );
});

test("uzunluk() boş dizide sıfır vermeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = []
            yaz(uzunluk(sayilar))
        `),
        ["0"]
    );
});

test("ekle() dizinin sonuna eleman eklemeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [10, 20]
            ekle(sayilar, 30)
            yaz(uzunluk(sayilar))
            yaz(sayilar[2])
        `),
        ["3", "30"]
    );
});

test("ekle() metin dizisine eleman eklemeli", () => {
    assert.deepEqual(
        run(`
            metin[] isimler = ["Ali"]
            ekle(isimler, "Ayşe")
            yaz(isimler[1])
        `),
        ["Ayşe"]
    );
});

test("ekle() yanlış türde eleman eklememeli", () => {
    assert.throws(
        () => run(`
            sayi[] sayilar = [10]
            ekle(sayilar, "Enes")
        `),
        /uyumsuz değer/
    );
});

test("sil() belirtilen elemanı silmeli ve döndürmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [10, 20, 30]
            sayi silinen = sil(sayilar, 1)
            yaz(silinen)
            yaz(uzunluk(sayilar))
            yaz(sayilar[1])
        `),
        ["20", "2", "30"]
    );
});

test("sil() geçersiz indeks için hata vermeli", () => {
    assert.throws(
        () => run(`
            sayi[] sayilar = [10, 20]
            sil(sayilar, 5)
        `),
        /Dizi indeksi sınır dışında/
    );
});

test("Yerleşik fonksiyonlar yanlış parametre sayısını reddetmeli", () => {
    assert.throws(
        () => run(`
            sayi[] sayilar = [10]
            uzunluk(sayilar, sayilar)
        `),
        /bir parametre bekliyor/
    );
});


// ALGOR 0.4.0 - Dizi parametreleri

test("Fonksiyon sayı dizisi parametresi alabilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon toplam(sayi[] degerler) {
                dondur degerler[0] + degerler[1] + degerler[2]
            }

            sayi[] notlar = [70, 85, 90]
            yaz(toplam(notlar))
        `),
        ["245"]
    );
});

test("Fonksiyon metin dizisi parametresi alabilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon ilkIsim(metin[] isimler) {
                dondur isimler[0]
            }

            metin[] isimler = ["Ali", "Ayşe"]
            yaz(ilkIsim(isimler))
        `),
        ["Ali"]
    );
});

test("Fonksiyon dizi parametresindeki elemanı değiştirebilmeli", () => {
    assert.deepEqual(
        run(`
            fonksiyon notGuncelle(sayi[] notlar) {
                notlar[0] = 100
            }

            sayi[] degerler = [70, 80]
            notGuncelle(degerler)
            yaz(degerler[0])
        `),
        ["100"]
    );
});

test("Fonksiyon yanlış türde dizi parametresini reddetmeli", () => {
    assert.throws(
        () => run(`
            fonksiyon hesapla(sayi[] degerler) {
                dondur degerler[0]
            }

            metin[] isimler = ["Ali", "Ayşe"]
            yaz(hesapla(isimler))
        `),
        /uyumsuz dizi/
    );
});



// ALGOR 0.4.0 - her döngüsü

test("her döngüsü sayı dizisini dolaşmalı", () => {
    assert.deepEqual(
        run(`
            sayi[] notlar = [70, 85, 90, 100]
            her not icinde notlar {
                yaz(not)
            }
        `),
        ["70", "85", "90", "100"]
    );
});

test("her döngüsü metin dizisini dolaşmalı", () => {
    assert.deepEqual(
        run(`
            metin[] isimler = ["Ali", "Ayşe", "Mehmet"]
            her isim icinde isimler {
                yaz(isim)
            }
        `),
        ["Ali", "Ayşe", "Mehmet"]
    );
});

test("her döngüsü boş dizide çalışmamalı", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = []
            her eleman icinde sayilar {
                yaz(eleman)
            }
            yaz("Tamam")
        `),
        ["Tamam"]
    );
});

test("her döngüsü dizi olmayan değerleri reddetmeli", () => {
    assert.throws(
        () => run(`
            sayi deger = 10
            her eleman icinde deger {
                yaz(eleman)
            }
        `),
        /yalnızca diziler/
    );
});



test("devam komutu mevcut turu atlamalı", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [1, 2, 3, 4, 5]
            her eleman icinde sayilar {
                eger eleman == 3 {
                    devam
                }
                yaz(eleman)
            }
        `),
        ["1", "2", "4", "5"]
    );
});

test("kir komutu her döngüsünü bitirmeli", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [1, 2, 3, 4, 5]
            her eleman icinde sayilar {
                eger eleman == 3 {
                    kir
                }
                yaz(eleman)
            }
        `),
        ["1", "2"]
    );
});

test("kir ve devam birlikte çalışmalı", () => {
    assert.deepEqual(
        run(`
            sayi[] sayilar = [1, 2, 3, 4, 5]
            her eleman icinde sayilar {
                eger eleman == 3 {
                    devam
                }
                eger eleman == 5 {
                    kir
                }
                yaz(eleman)
            }
        `),
        ["1", "2", "4"]
    );
});

test("kir yalnızca en içteki döngüyü bitirmeli", () => {
    assert.deepEqual(
        run(`
            sayi dis = 1
            sayi ic = 1

            dongu dis <= 2 {
                ic = 1

                dongu ic <= 3 {
                    eger ic == 2 {
                        kir
                    }
                    yaz(dis * 10 + ic)
                    ic = ic + 1
                }

                dis = dis + 1
            }
        `),
        ["11", "21"]
    );
});

test("kir döngü dışında hata vermeli", () => {
    assert.throws(
        () => run("kir"),
        /kir komutu yalnızca döngü içinde kullanılabilir/
    );
});

test("devam döngü dışında hata vermeli", () => {
    assert.throws(
        () => run("devam"),
        /devam komutu yalnızca döngü içinde kullanılabilir/
    );
});

test("fonksiyon içindeki kir dış döngüyü etkilememeli", () => {
    assert.throws(
        () => run(`
            fonksiyon durdur() {
                kir
            }
            sayi i = 1
            dongu i <= 2 {
                durdur()
                i = i + 1
            }
        `),
        /kir komutu yalnızca döngü içinde kullanılabilir/
    );
});

test("aralik() artan sayı dizisi üretmeli", () => {
    assert.deepEqual(run(`
        sayi[] sayilar = aralik(1, 5)
        her eleman icinde sayilar {
            yaz(eleman)
        }
    `), ["1", "2", "3", "4", "5"]);
});

test("aralik() adımlı ve azalan dizi üretmeli", () => {
    assert.deepEqual(run(`
        sayi[] sayilar = aralik(10, 2, -2)
        her eleman icinde sayilar {
            yaz(eleman)
        }
    `), ["10", "8", "6", "4", "2"]);
});

test("aralik() sıfır adımı reddetmeli", () => {
    assert.throws(() => run("sayi[] sayilar = aralik(1, 5, 0)"), /adımı sıfır olamaz/);
});

test("aralik() yanlış yöndeki adımı reddetmeli", () => {
    assert.throws(() => run("sayi[] sayilar = aralik(1, 5, -1)"), /belirtilen yönde ilerlemeli/);
});

test("rastgele() sınırlar içinde tam sayı üretmeli", () => {
    const value = Number(run("yaz(rastgele(5, 10))")[0]);
    assert.ok(Number.isInteger(value));
    assert.ok(value >= 5 && value <= 10);
});

test("rastgele() eşit sınırları desteklemeli", () => {
    assert.deepEqual(run("yaz(rastgele(7, 7))"), ["7"]);
});

test("rastgele() ters sınırları reddetmeli", () => {
    assert.throws(() => run("yaz(rastgele(10, 5))"), /ilk değer ikinci değerden büyük olamaz/);
});

test("mod ve yüzde operatörü kalan hesaplamalı", () => {
    assert.deepEqual(run(`
        yaz(17 mod 5)
        yaz(17 % 5)
    `), ["2", "2"]);
});

test("mod işlem önceliğini korumalı", () => {
    assert.deepEqual(run("yaz(2 + 10 mod 4 * 2)"), ["6"]);
});

test("sıfıra mod alma hatası vermeli", () => {
    assert.throws(() => run("yaz(10 mod 0)"), /Mod alma işleminde bölen sıfır olamaz/);
});

test("sec eşleşen durum bloğunu çalıştırmalı", () => {
    assert.deepEqual(run(`
        sayi secim = 2
        sec secim {
            durum 1 {
                yaz("Bir")
            }
            durum 2 {
                yaz("İki")
            }
            durum 3 {
                yaz("Üç")
            }
            varsayilan {
                yaz("Diğer")
            }
        }
    `), ["İki"]);
});

test("sec eşleşme yoksa varsayilan bloğunu çalıştırmalı", () => {
    assert.deepEqual(run(`
        sec 9 {
            durum 1 {
                yaz("Bir")
            }
            varsayilan {
                yaz("Diğer")
            }
        }
    `), ["Diğer"]);
});

test("sec varsayilan olmadan çalışmalı", () => {
    assert.deepEqual(run(`
        sec 9 {
            durum 1 {
                yaz("Bir")
            }
        }
        yaz("Devam")
    `), ["Devam"]);
});

test("ve kısa devre yapmalı", () => {
    assert.deepEqual(run(`
        mantik sonuc = yanlis ve (1 / 0 == 0)
        yaz(sonuc)
    `), ["false"]);
});

test("veya kısa devre yapmalı", () => {
    assert.deepEqual(run(`
        mantik sonuc = dogru veya (1 / 0 == 0)
        yaz(sonuc)
    `), ["true"]);
});

test("mantıksal işlem sol tarafta boolean zorunlu tutmalı", () => {
    assert.throws(() => run("yaz(1 veya dogru)"), /Mantıksal işlemlerde boolean değer kullanılmalı/);
});

test("mantıksal işlem sağ tarafta boolean zorunlu tutmalı", () => {
    assert.throws(() => run("yaz(dogru ve 1)"), /Mantıksal işlemlerde boolean değer kullanılmalı/);
});

test("dongu koşulu boolean olmayan değeri reddetmeli", () => {
    assert.throws(() => run(`
        dongu 1 {
            yaz("Çalışmamalı")
        }
    `), /dongu koşulu mantıksal değer olmalı/);
});

test("çalışma zamanı hatasında satır ve sütun bilgisi bulunmalı", () => {
    let capturedError;

    try {
        run(`
            sayi sonuc = 10 / 0
        `);
    } catch (error) {
        capturedError = error;
    }

    assert.ok(capturedError);
    assert.equal(capturedError.line, 2);
    assert.ok(Number.isInteger(capturedError.column));
});

test("aralik() adım belirtilmediğinde azalan dizi üretmeli", () => {
    assert.deepEqual(run(`
        sayi[] sayilar = aralik(5, 1)
        her eleman icinde sayilar {
            yaz(eleman)
        }
    `), ["5", "4", "3", "2", "1"]);
});


test("sabit sayı değişkenini tanımlayıp yazdırmalı", () => {
    assert.deepEqual(
        run("sabit sayi yas = 18 yaz(yas)"),
        ["18"]
    );
});

test("sabit metin değişkenini korumalı", () => {
    assert.deepEqual(
        run('sabit metin isim = "ALGOR" yaz(isim)'),
        ["ALGOR"]
    );
});

test("sabit mantık değişkenini korumalı", () => {
    assert.deepEqual(
        run("sabit mantik aktif = dogru yaz(aktif)"),
        ["true"]
    );
});

test("sabit sayı değişkenine yeniden değer atanmasını engellemeli", () => {
    assert.throws(
        () => run("sabit sayi yas = 18 yas = 20"),
        /sabit olduğu için değeri değiştirilemez/
    );
});

test("sabit dizinin elemanlarını okumaya izin vermeli", () => {
    assert.deepEqual(
        run("sabit sayi[] sayilar = [10, 20] yaz(sayilar[0])"),
        ["10"]
    );
});

test("sabit dizinin elemanının değiştirilmesini engellemeli", () => {
    assert.throws(
        () => run("sabit sayi[] sayilar = [10, 20] sayilar[0] = 5"),
        /sabit olduğu için değiştirilemez/
    );
});

test("ekle() sabit diziye eleman eklemeyi engellemeli", () => {
    assert.throws(
        () => run("sabit sayi[] sayilar = [10, 20] ekle(sayilar, 30)"),
        /Sabit diziye eleman eklenemez/
    );
});

test("sil() sabit diziden eleman silmeyi engellemeli", () => {
    assert.throws(
        () => run("sabit sayi[] sayilar = [10, 20] sil(sayilar, 0)"),
        /Sabit diziden eleman silinemez/
    );
});

test("Fonksiyon sabit dizinin elemanını değiştirememeli", () => {
    assert.throws(
        () => run(`
            fonksiyon degistir(sayi[] veriler) {
                veriler[0] = 99
            }

            sabit sayi[] sayilar = [10, 20]
            degistir(sayilar)
        `),
        /sabit olduğu için değiştirilemez/
    );
});

test("Fonksiyon ekle() ile sabit diziyi değiştirememeli", () => {
    assert.throws(
        () => run(`
            fonksiyon ekleDeger(sayi[] veriler) {
                ekle(veriler, 30)
            }

            sabit sayi[] sayilar = [10, 20]
            ekleDeger(sayilar)
        `),
        /Sabit diziye eleman eklenemez/
    );
});

test("Fonksiyon sil() ile sabit diziyi değiştirememeli", () => {
    assert.throws(
        () => run(`
            fonksiyon silDeger(sayi[] veriler) {
                sil(veriler, 0)
            }

            sabit sayi[] sayilar = [10, 20]
            silDeger(sayilar)
        `),
        /Sabit diziden eleman silinemez/
    );
});
