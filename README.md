# ALGOR

<div align="center">

<img src="vscode-extension/algor-logo-128.png" width="128" alt="ALGOR Logo">

### Türkçe anahtar kelimelerle programlama.

**Kodlamaya kendi dilinde başla.**

[![GitHub](https://img.shields.io/badge/GitHub-ALGOR-181717?logo=github)](https://github.com/enestahayondem/Algor)
[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/AlgorProgramming.algor-language?label=VS%20Code%20Eklentisi)](https://marketplace.visualstudio.com/items?itemName=AlgorProgramming.algor-language)
[![Lisans](https://img.shields.io/badge/Lisans-MIT-blue.svg)](LICENSE)

</div>

## ALGOR nedir?

ALGOR, programlamayı Türkçe anahtar kelimelerle öğrenmek ve yazılım geliştirmek isteyenler için tasarlanan, **Node.js üzerinde çalışan yorumlanan bir programlama dilidir.** Değişken tanımlama, koşullar, döngüler, fonksiyonlar, diziler ve modüller gibi temel programlama yapılarını Türkçe ifadelerle kullanmanı sağlar.

ALGOR'un amacı yalnızca İngilizce komutların Türkçe karşılıklarını sunmak değildir. Hedef; okunabilir sözdizimine sahip, öğrenmesi kolay, örneklerle geliştirilebilen ve zaman içinde büyüyebilen bir programlama dili oluşturmaktır.

> ALGOR aktif geliştirme aşamasındadır. `1.0.0` öncesinde sözdizimi ve davranışlar değişebilir. Bu README, depodaki mevcut uygulamayı esas alır; henüz desteklenmeyen özellikleri vaat etmez.

## İçindekiler

- [Öne çıkan özellikler](#öne-çıkan-özellikler)
- [Hızlı başlangıç](#hızlı-başlangıç)
- [Kurulum ve çalıştırma](#kurulum-ve-çalıştırma)
- [İlk ALGOR programın](#ilk-algor-programın)
- [Temel sözdizimi](#temel-sözdizimi)
  - [Yorum satırları](#yorum-satırları)
  - [Değişkenler ve veri türleri](#değişkenler-ve-veri-türleri)
  - [Sabitler](#sabitler)
  - [Operatörler](#operatörler)
  - [Ekrana yazdırma ve kullanıcı girdisi](#ekrana-yazdırma-ve-kullanıcı-girdisi)
- [Koşul ifadeleri](#koşul-ifadeleri)
- [Döngüler](#döngüler)
- [Fonksiyonlar](#fonksiyonlar)
- [Diziler](#diziler)
- [Yerleşik fonksiyonlar](#yerleşik-fonksiyonlar)
- [Modül sistemi](#modül-sistemi)
- [Hata mesajları](#hata-mesajları)
- [Visual Studio Code desteği](#visual-studio-code-desteği)
- [Örnek projeler](#örnek-projeler)
- [Proje yapısı](#proje-yapısı)
- [Testleri çalıştırma](#testleri-çalıştırma)
- [Katkıda bulunma](#katkıda-bulunma)
- [Lisans ve bağlantılar](#lisans-ve-bağlantılar)

## Öne çıkan özellikler

- **Türkçe sözdizimi:** `sayi`, `metin`, `eger`, `dongu`, `fonksiyon`, `dondur` gibi anahtar kelimeler.
- **Veri türleri:** Sayı, metin ve mantıksal değerler.
- **Değişkenler ve sabitler:** Tür belirterek değişken tanımlama ve `sabit` ile değişmez değerler oluşturma.
- **Koşullar:** `eger` ve `degilse` blokları.
- **Döngüler:** Koşullu `dongu` ve koleksiyon üzerinde `her` döngüsü.
- **Döngü kontrolü:** `kir` ile döngüden çıkma, `devam` ile sonraki adıma geçme.
- **Fonksiyonlar:** Parametreler, dönüş değerleri, yerel kapsam ve özyineleme.
- **Diziler:** Tipli diziler, indeksleme, eleman güncelleme ve dizi yardımcıları.
- **Seçim yapısı:** `sec`, `durum` ve `varsayilan`.
- **Kullanıcı girdisi:** `oku()` ile konsoldan veri alma.
- **Modüller:** `aktar` ile dosyadan kod içe aktarma; `disari` ile değişken ve fonksiyon dışa aktarma.
- **Hata konumları:** Çalışma zamanı hatalarında satır ve sütun bilgisi.
- **VS Code desteği:** Sözdizimi renklendirme, kod parçacıkları, dosya simgeleri ve dosya çalıştırma komutu.

## Hızlı başlangıç

Depoyu bilgisayarına aldıktan sonra bir `.algor` dosyası oluşturabilir ve CLI üzerinden çalıştırabilirsin:

```bash
git clone https://github.com/enestahayondem/Algor.git
cd Algor
node src/cli.js examples/merhaba.algor
```

İlk programın:

```algor
sayi yas = 18
sayi gelecekYas = yas + 1

yaz("Yaşım:", yas)
yaz("Gelecek yıl:", gelecekYas)
```

Programı `merhaba.algor` adıyla kaydet ve şu komutla çalıştır:

```bash
node src/cli.js merhaba.algor
```

## Kurulum ve çalıştırma

### Gereksinimler

- [Node.js](https://nodejs.org/) çalışma ortamı
- [Git](https://git-scm.com/) (depoyu klonlamak için)
- İsteğe bağlı olarak [Visual Studio Code](https://code.visualstudio.com/)

### Depoyu klonlama

```bash
git clone https://github.com/enestahayondem/Algor.git
cd Algor
```

### Bir ALGOR dosyasını çalıştırma

ALGOR kaynak dosyalarının uzantısı `.algor` şeklindedir. CLI dosya yolunu argüman olarak alır:

```bash
node src/cli.js program.algor
```

Depodaki bir örneği çalıştırmak için:

```bash
node src/cli.js examples/fonksiyonlar.algor
```

Dosya yolu geçerli olmalı ve dosya okunabilmelidir. Bir programda hata oluşursa CLI hata mesajını terminale yazdırır ve başarısız çıkış koduyla sonlanır.

> Not: Projedeki `package.json`, `algor` komutunu `src/cli.js` dosyasına bağlar. Proje şu anda kaynak depodan doğrudan `node src/cli.js dosya.algor` biçiminde çalıştırılabilir. npm üzerinden yayımlanmış küresel bir paket olduğu varsayılmamalıdır.

## İlk ALGOR programın

Bir `.algor` dosyasına aşağıdaki kodu yaz:

```algor
// İlk ALGOR programım

metin isim = "Dünya"
sayi sayi1 = 10
sayi sayi2 = 20
sayi toplam = sayi1 + sayi2

yaz("Merhaba", isim)
yaz("Toplam:", toplam)

eger toplam > 20 {
    yaz("Toplam 20'den büyük.")
} degilse {
    yaz("Toplam 20 veya daha küçük.")
}
```

Bu programda:

1. `metin` türünde bir değişken tanımlanır.
2. İki `sayi` değişkeni oluşturulur.
3. Aritmetik işlemle toplam hesaplanır.
4. `yaz()` ile değerler ekrana basılır.
5. `eger` / `degilse` ile koşula göre farklı kodlar çalıştırılır.

## Temel sözdizimi

### Yorum satırları

`//` ile başlayan satırlar yorum olarak kullanılır ve programın çalışmasını etkilemez:

```algor
// Bu bir yorum satırıdır.
sayi puan = 95 // Satır sonunda da yorum yazılabilir.
```

### Değişkenler ve veri türleri

ALGOR'da değişken tanımlarken önce tür, sonra değişken adı ve değer yazılır.

**Sayı (`sayi`)**

```algor
sayi yas = 18
sayi fiyat = 149.90
sayi sonuc = yas + fiyat
```

**Metin (`metin`)**

```algor
metin isim = "Ayşe"
metin mesaj = "Merhaba ALGOR"
metin tamMesaj = "Merhaba " + isim
```

Metinler çift tırnakla yazılır. `+` operatörü metinleri birleştirmek için de kullanılabilir.

**Mantıksal değer (`mantik`)**

```algor
mantik aktif = dogru
mantik tamamlandi = yanlis
```

Mantıksal değerler `dogru` ve `yanlis` anahtar kelimeleriyle ifade edilir.

**Dizi türleri**

Dizi türü, temel türün sonuna `[]` eklenerek belirtilir:

```algor
sayi[] notlar = [80, 90, 100]
metin[] isimler = ["Ali", "Ayşe"]
mantik[] durumlar = [dogru, yanlis]
```

### Sabitler

Değeri sonradan değiştirilemeyen tanımlar için `sabit` kullanılır:

```algor
sabit sayi piYaklasik = 3
sabit metin uygulamaAdi = "ALGOR"
sabit mantik yayinlandi = dogru
```

Sabit bir değişkene yeniden değer atamaya çalışmak çalışma zamanı hatasına neden olur. Sabit diziler de değiştirilemez; eleman ekleme veya silme işlemi yapılamaz.

### Operatörler

Aşağıdaki operatörler ALGOR'un mevcut ifade ve çalışma zamanı yapısında kullanılan temel operatörlerdir.

| Grup | Operatörler | Kullanım |
|---|---|---|
| Aritmetik | `+`, `-`, `*`, `/`, `%` | Matematiksel işlemler |
| Karşılaştırma | `==`, `!=`, `<`, `>`, `<=`, `>=` | Değerleri karşılaştırma |
| Mantıksal | `ve`, `veya`, `degil` | Mantıksal ifadeler |
| Atama | `=` | Değişkene değer atama |
| Dizi indeksi | `[ ]` | Dizinin elemanına erişme |

Örnek:

```algor
sayi a = 12
sayi b = 5

yaz(a + b)
yaz(a - b)
yaz(a * b)
yaz(a / b)
yaz(a % b)

yaz(a > b)
yaz(a == b)
```

Mantıksal ifadelerde kısa devre değerlendirmesi uygulanır: Sonucun belirlenmesi için ikinci ifadenin değerlendirilmesi gerekmiyorsa o ifade çalıştırılmaz.

### Ekrana yazdırma ve kullanıcı girdisi

**`yaz()`**

Bir veya birden fazla değeri terminale yazdırır:

```algor
metin isim = "Mehmet"
sayi puan = 90

yaz("Öğrenci:", isim)
yaz("Puan:", puan)
yaz("Sınav tamamlandı.")
```

**`oku()`**

Kullanıcıdan konsol üzerinden metin girdisi alır. İsteğe bağlı metin mesajı gösterilebilir:

```algor
metin isim = oku("Adını gir: ")
yaz("Merhaba", isim)
```

`oku()` bir ifade olarak kullanılabilir. Girilen değeri ihtiyacına göre program içinde işle.

## Koşul ifadeleri

### `eger`

Bir koşul doğru olduğunda ilgili blok çalışır:

```algor
sayi not = 75

eger not >= 50 {
    yaz("Başarılı")
}
```

### `degilse`

Koşul yanlış olduğunda alternatif blok çalışır:

```algor
sayi sicaklik = 12

eger sicaklik > 25 {
    yaz("Hava sıcak.")
} degilse {
    yaz("Hava sıcak değil.")
}
```

Koşullar başka koşullarla birlikte kullanılabilir:

```algor
sayi puan = 85

eger puan >= 85 {
    yaz("Çok iyi")
} degilse {
    eger puan >= 50 {
        yaz("Başarılı")
    } degilse {
        yaz("Tekrar dene")
    }
}
```

### `sec`, `durum` ve `varsayilan`

Bir ifadenin değerine göre farklı bloklar çalıştırmak için `sec` yapısı kullanılır:

```algor
sayi gun = 2

sec gun {
    durum 1 {
        yaz("Pazartesi")
    }
    durum 2 {
        yaz("Salı")
    }
    durum 3 {
        yaz("Çarşamba")
    }
    varsayilan {
        yaz("Tanımsız gün")
    }
}
```

`varsayilan` eşleşen bir `durum` bulunmadığında çalışır. Her `sec` bloğunda en az bir `durum` bulunmalıdır.

## Döngüler

### `dongu`

Bir koşul doğru olduğu sürece blok tekrar çalışır:

```algor
sayi sayac = 1

dongu sayac <= 5 {
    yaz("Sayaç:", sayac)
    sayac = sayac + 1
}
```

Döngü içinde koşulu değiştirmeyi unutma. Aksi durumda döngü beklenenden uzun sürebilir. Mevcut çalışma zamanında döngüler için güvenlik amaçlı yineleme sınırı bulunur.

### `her`

Bir dizinin elemanları üzerinde sırayla işlem yapmak için kullanılır:

```algor
sayi[] sayilar = [10, 20, 30, 40]

her eleman icinde sayilar {
    yaz("Değer:", eleman)
}
```

`eleman`, her yinelemede dizinin o anki elemanını temsil eder.

### `kir`

Bulunduğu döngüyü sonlandırır:

```algor
sayi sayac = 1

dongu sayac <= 10 {
    eger sayac == 5 {
        kir
    }

    yaz(sayac)
    sayac = sayac + 1
}
```

### `devam`

Geçerli yinelemenin kalan kısmını atlar ve döngünün sonraki adımına geçer:

```algor
sayi sayac = 0

dongu sayac < 5 {
    sayac = sayac + 1

    eger sayac == 3 {
        devam
    }

    yaz(sayac)
}
```

`kir` ve `devam` yalnızca döngü içinde kullanılmalıdır.

## Fonksiyonlar

Fonksiyonlar, tekrar kullanılabilir kod blokları oluşturmaya yarar. `fonksiyon` anahtar kelimesinden sonra fonksiyon adı ve parametreleri yazılır.

### Parametresiz fonksiyon

```algor
fonksiyon selamVer() {
    yaz("Merhaba!")
}

selamVer()
```

### Parametre alan fonksiyon

Parametrelerin türleri tanımlanır:

```algor
fonksiyon selamla(metin isim) {
    yaz("Merhaba", isim)
}

selamla("Deniz")
```

### Değer döndüren fonksiyon

`dondur`, fonksiyonun sonucunu çağrıldığı yere geri gönderir:

```algor
fonksiyon topla(sayi a, sayi b) {
    dondur a + b
}

sayi sonuc = topla(15, 25)
yaz(sonuc)
```

### Özyineleme

Bir fonksiyonun kendisini çağırmasına özyineleme (recursion) denir:

```algor
fonksiyon faktoriyel(sayi n) {
    eger n <= 1 {
        dondur 1
    }

    dondur n * faktoriyel(n - 1)
}

yaz(faktoriyel(5))
```

Bu örnekte `faktoriyel(5)` sonucu `120` olur. Özyinelemeli fonksiyonlarda durma koşulu tanımlamak önemlidir.

## Diziler

Diziler birden fazla değeri tek değişkende saklar. Dizi tanımlarken türün yanına `[]` eklenir.

### Dizi oluşturma

```algor
sayi[] notlar = [80, 90, 100]
metin[] sehirler = ["Samsun", "Sinop", "Ordu"]
mantik[] cevaplar = [dogru, yanlis]
```

### İndeks ile elemana erişme

Dizilerde indeksler `0` değerinden başlar:

```algor
sayi[] notlar = [80, 90, 100]

yaz(notlar[0])
yaz(notlar[1])
yaz(notlar[2])
```

### Eleman güncelleme

```algor
sayi[] notlar = [80, 90, 100]
notlar[2] = 95

yaz(notlar[2])
```

Dizi indeksinin geçerli aralıkta olması gerekir. Dizi sınırları dışındaki erişimler hata üretir.

### Dizilerle işlem yapma

```algor
sayi[] sayilar = [10, 20, 30]

sayi toplam = sayilar[0] + sayilar[1] + sayilar[2]
yaz("Toplam:", toplam)
```

## Yerleşik fonksiyonlar

ALGOR, diziler ve sayılarla çalışmak için yerleşik fonksiyonlar sunar.

| Fonksiyon | Açıklama | Örnek |
|---|---|---|
| `uzunluk(dizi)` | Dizinin eleman sayısını verir. | `uzunluk(notlar)` |
| `ekle(dizi, deger)` | Değiştirilebilir dizinin sonuna eleman ekler. | `ekle(notlar, 95)` |
| `sil(dizi, indeks)` | Diziden belirtilen indeksteki elemanı siler. | `sil(notlar, 0)` |
| `aralik(baslangic, bitis)` | Belirtilen aralıkta tam sayılardan dizi üretir. | `aralik(1, 5)` |
| `aralik(baslangic, bitis, adim)` | Belirtilen adımla dizi üretir. | `aralik(0, 10, 2)` |
| `rastgele(min, max)` | İki sınır arasında rastgele tam sayı üretir. | `rastgele(1, 100)` |
| `oku()` | Kullanıcıdan girdi alır. | `oku("Adın: ")` |

### `uzunluk()`

```algor
metin[] isimler = ["Ali", "Ayşe", "Mehmet"]
yaz(uzunluk(isimler))
```

### `ekle()`

```algor
sayi[] notlar = [70, 80]
ekle(notlar, 90)

yaz(uzunluk(notlar))
```

### `sil()`

```algor
sayi[] notlar = [70, 80, 90]
sil(notlar, 1)

yaz(notlar[1])
```

### `aralik()`

Başlangıç ve bitiş değerleri aralığa dahildir:

```algor
sayi[] sayilar = aralik(1, 5)

her sayi icinde sayilar {
    yaz(sayi)
}
```

Üçüncü parametre adımı belirler. Adım sıfır olamaz ve bitiş yönüyle uyumlu olmalıdır. Üretilen dizi için üst sınır uygulanır.

### `rastgele()`

```algor
sayi secim = rastgele(1, 6)
yaz("Zar sonucu:", secim)
```

`rastgele()` tam sayı sınırlarıyla çalışır ve iki parametre bekler.

### `oku()` ile kullanıcı girdisi

`oku()` kullanıcıdan konsol üzerinden bir satır girdi alır. İsteğe bağlı olarak kullanıcıya gösterilecek bir mesaj da verebilirsin.

Girdi, tanımlanan değişkenin türüne göre otomatik dönüştürülür:

```algor
metin isim = oku("Adını gir: ")
sayi yas = oku("Yaşını gir: ")
mantik onay = oku("Devam edilsin mi? (dogru/yanlis): ")

yaz("Merhaba", isim)
yaz("Yaşın:", yas)
yaz("Onay:", onay)
```

- `metin` değişkeninde girdi metin olarak saklanır.
- `sayi` değişkeninde geçerli bir sayıya dönüştürülür. Boş veya geçersiz giriş hata oluşturur.
- `mantik` değişkeninde `dogru` veya `yanlis` değerleri kabul edilir. Büyük/küçük harf duyarsızdır; diğer değerler hata oluşturur.

`oku()` tek başına kullanıldığında da girdi metin olarak döndürülür. Tür dönüşümü, doğrudan değişken tanımlama veya atama sırasında uygulanır.

## Modül sistemi

ALGOR, kodu farklı `.algor` dosyalarına ayırmaya ve bu dosyalardan dışa aktarılan tanımları kullanmaya olanak tanır.

### Dosyadan modül aktarma

`aktar` ile başka bir ALGOR dosyasını içe aktarabilirsin:

```algor
aktar "matematik.algor"

sayi sonuc = topla(10, 20)
yaz(sonuc)
```

Dosya yolu, içe aktarma yapan dosyanın konumuna göre çözülür. İç içe modül aktarımları desteklenir ve aynı modülün tekrar yüklenmesi önlenir.

### Dışa aktarma

Bir modülden fonksiyon veya değişken dışa aktarmak için `disari` kullanılır:

```algor
disari fonksiyon topla(sayi a, sayi b) {
    dondur a + b
}

disari sayi sabitDeger = 42
```

Dışa aktarılan sabitler de tanımlanabilir:

```algor
disari sabit sayi limit = 100
```

### Örnek dosya yapısı

```text
proje/
├── ana.algor
└── matematik.algor
```

`matematik.algor`:

```algor
disari fonksiyon topla(sayi a, sayi b) {
    dondur a + b
}
```

`ana.algor`:

```algor
aktar "matematik.algor"

yaz(topla(12, 30))
```

Modül dosyalarında üst düzeyde içe aktarma ve dışa aktarılan tanımlar kullanılır. Modüller arasında aynı isimle birden fazla dışa aktarma yapılamaz. Modül döngüleri tespit edilir.

## Hata mesajları

ALGOR, sözdizimi veya çalışma zamanı sırasında oluşan sorunları hata mesajlarıyla bildirir. Uygun durumlarda hata konumu satır ve sütun bilgisiyle gösterilir.

Hata ayıklarken şu adımları izle:

1. Hata mesajındaki satır ve sütunu kontrol et.
2. Değişkenin tanımlı ve doğru türde olduğundan emin ol.
3. Parantezlerin ve süslü parantezlerin eşleştiğini kontrol et.
4. Dizi indeksinin geçerli aralıkta olduğunu doğrula.
5. Sabit değişken veya sabit dizi üzerinde değişiklik yapmadığından emin ol.
6. Fonksiyon çağrılarında parametre sayısını ve türlerini kontrol et.
7. `aktar` dosya yolunun doğru olduğundan emin ol.

Örneğin tanımlanmamış bir değişkeni kullanmak, yanlış türde değer atamak, sabit değeri değiştirmek veya dizi sınırları dışında elemana erişmek hata oluşturabilir.

## Visual Studio Code desteği

ALGOR için resmi Visual Studio Code eklentisi bulunmaktadır.

**[ALGOR – Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AlgorProgramming.algor-language)**

Eklenti özellikleri:

- `.algor` dosyalarının ALGOR dili olarak tanınması
- Sözdizimi renklendirme
- Kod parçacıkları (snippets)
- ALGOR dosyaları için dosya simgesi teması
- Editörden program çalıştırma komutu
- Dosya başlığından, sağ tık menüsünden ve Explorer menüsünden çalıştırma

### Eklentiyi kurma

1. Visual Studio Code'u aç.
2. Extensions bölümüne gir.
3. Arama alanına `ALGOR Programming Language` yaz.
4. `AlgorProgramming` yayıncısının eklentisini seç.
5. Install düğmesine bas.
6. Bir `.algor` dosyası aç.

### Program çalıştırma

Bir ALGOR dosyası açıkken:

- `Alt + Cmd + R` kısayolunu kullanabilirsin (macOS).
- Editörün üst kısmındaki çalıştırma komutunu kullanabilirsin.
- Editörde veya Explorer'da sağ tıklayıp `ALGOR: Dosyayı Çalıştır` komutunu seçebilirsin.

Eklenti, bilgisayarında Node.js bulunmasını gerektirir. Programı çalıştırmak için eklenti paketinin içindeki ALGOR çalışma zamanı kullanılır.

## Örnek projeler

Depodaki `examples/` klasöründe ALGOR'un temel sözdizimini ve gelişmiş özelliklerini gösteren örnek programlar bulunur.

| Dosya | İçerik |
|---|---|
| [`merhaba.algor`](examples/merhaba.algor) | Değişken tanımlama ve ekrana yazdırma |
| [`diziler.algor`](examples/diziler.algor) | Sayı, metin ve mantık dizileri; indeksleme ve güncelleme |
| [`fonksiyonlar.algor`](examples/fonksiyonlar.algor) | Parametreler, dönüş değerleri ve özyineleme |
| [`dizi-islemleri.algor`](examples/dizi-islemleri.algor) | Dizi üzerinde dolaşma, eleman ekleme ve silme, ortalama hesaplama |
| [`kosullar.algor`](examples/kosullar.algor) | `eger`, `degilse` ve `sec` koşul yapıları |
| [`donguler.algor`](examples/donguler.algor) | `dongu`, `her`, `devam` ve `kir` döngü komutları |
| [`moduller/ana.algor`](examples/moduller/ana.algor) | Başka bir dosyadan modül aktarma ve dışa aktarılan fonksiyonları kullanma |
| [`moduller/matematik.algor`](examples/moduller/matematik.algor) | Modül içinden fonksiyonları dışa aktarma |

Örnekleri proje ana dizinindeyken terminalden çalıştırabilirsin:

```bash
node src/cli.js examples/merhaba.algor
node src/cli.js examples/diziler.algor
node src/cli.js examples/fonksiyonlar.algor
node src/cli.js examples/dizi-islemleri.algor
node src/cli.js examples/kosullar.algor
node src/cli.js examples/donguler.algor
node src/cli.js examples/moduller/ana.algor
```

## Proje yapısı

```text
Algor/
├── examples/
│   ├── merhaba.algor
│   ├── diziler.algor
│   ├── fonksiyonlar.algor
│   ├── dizi-islemleri.algor
│   ├── kosullar.algor
│   ├── donguler.algor
│   └── moduller/
│       ├── ana.algor
│       └── matematik.algor
├── src/
│   ├── cli.js
│   ├── errors/
│   ├── lexer/
│   ├── parser/
│   └── runtime/
│       ├── interpreter.js
│       └── module-loader.js
├── tests/
├── vscode-extension/
├── README.md
└── package.json
```

## Testleri çalıştırma

ALGOR'un otomatik testleri Node.js'in yerleşik test altyapısını kullanır.

Proje dizininde:

```bash
npm test
```

Testler lexer, parser, yorumlayıcı ve modül yükleyici davranışlarını kapsar. Yeni bir özellik veya hata düzeltmesi üzerinde çalışırken testleri çalıştırarak mevcut davranışların korunup korunmadığını kontrol et.

## Katkıda bulunma

ALGOR'u geliştirmek, hata bildirmek veya yeni fikirler paylaşmak isteyen herkese katkı kapısı açıktır.

1. Depoyu fork et.
2. Yeni bir dal oluştur.
3. Değişikliklerini yap.
4. `npm test` komutuyla testleri çalıştır.
5. Değişikliklerini açıklayan bir Pull Request gönder.

Hata bildirimlerinde mümkünse şu bilgileri ekle:

- İşletim sistemi ve Node.js sürümü
- Çalıştırdığın ALGOR kodu
- Aldığın hata mesajı
- Beklediğin davranış
- Gerçekte gerçekleşen davranış

Katkı ve hata bildirimleri için: [GitHub Issues](https://github.com/enestahayondem/Algor/issues)

## Lisans ve bağlantılar

ALGOR MIT lisansı kapsamında sunulmaktadır. Ayrıntılar için depodaki [LICENSE](LICENSE) dosyasına bak.

- **Kaynak kod:** [GitHub – enestahayondem/Algor](https://github.com/enestahayondem/Algor)
- **Hata bildirimi ve öneriler:** [GitHub Issues](https://github.com/enestahayondem/Algor/issues)
- **VS Code eklentisi:** [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AlgorProgramming.algor-language)
- **Web sitesi:** [algorleng.com.tr](https://algorleng.com.tr)
- **Node.js:** [nodejs.org](https://nodejs.org/)
- **Visual Studio Code:** [code.visualstudio.com](https://code.visualstudio.com/)

---

<div align="center">

**ALGOR — Türkçe düşün, Türkçe kodla.**

</div>