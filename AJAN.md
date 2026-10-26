# Hap bilgi ajanı: çalışma talimatı

Bu depo, @celikkayamulk Instagram hesabının ve Facebook sayfasının otomatik hap bilgi gönderileri içindir. Ajan bu dosyayı her çalışmada baştan sona okur ve uygular. Tüm içerik Türkçe.

## Takvim

Her gün aynı konu iki biçimde yayınlanır (hangisinin daha çok ilgi gördüğünü karşılaştırmak için):

- **12:30 reels:** karakterli animasyon video (1080x1920, ~29 sn)
- **20:30 carousel:** 7 sayfalık kaydırmalı görsel (1080x1350)

Ajan hafta içi her gün 09:46'da (Europe/Istanbul) çalışır:

| Çalışma günü | Hazırlanan günler |
| --- | --- |
| Pazartesi | Salı |
| Salı | Çarşamba |
| Çarşamba | Perşembe |
| Perşembe | Cuma |
| Cuma | Cumartesi, Pazar, Pazartesi |

Hazırlamadan önce `posts/` klasörüne ve Metricool'daki zamanlanmış gönderilere bak (getScheduledPosts, brandId `7665597`, timezone `Europe/Istanbul`). O tarih için reels ve carousel zaten varsa o günü atla; yalnızca biri eksikse eksik olanı aynı `post.json`'dan üret.

## Sabit bilgiler

- Metricool brand/blogId: `7665597`; ağlar: instagram (@celikkayamulk) ve facebook (Çelikkaya Mülk Yapı A.Ş. sayfası)
- Dosya adresi: `https://raw.githubusercontent.com/emincelikkaya/celikkaya-instagram/<commit>/posts/<YYYY-MM-DD>/<dosya>` (commit kısaltması kullan, `main` yerine; önbellek sorunlarını önler)
- Şablonlar: `tools/slides.js` (carousel), `tools/reel.html` (reels). Üretim: `tools/render_carousel.py`, `tools/render_reel.py`. Fontlar ve logo `tools/` içinde.
- Konu listesi ve kullanım kaydı: `KONULAR.md`

## Adımlar (her gün için)

1. **Konu:** `KONULAR.md`'de durumu boş olan ilk konuyu al. Hap bilgi numarası = `posts/` içindeki en büyük `no` + 1.
2. **Doğrulama:** Oran, süre, tutar, madde numarası içeren her bilgiyi resmi kaynaktan doğrula: mevzuat.gov.tr (6306 sayılı Kanun: `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6306&MevzuatTur=1&MevzuatTertip=5`), resmigazete.gov.tr, csb.gov.tr. Bu siteler otomatik okumaya kapalı; kullanıcının bilgisayarındaki Claude tarayıcısıyla aç ve `javascript_tool` ile `document.body.innerText` içinde ilgili maddeyi ara. Doğrulayamadığın bilgiyi kullanma; konunun özü doğrulanamıyorsa konuyu `KONULAR.md`'de "ertelendi: <neden>" olarak işaretle ve sıradakine geç.
3. **İçerik:** `posts/<tarih>/post.json` yaz (şema: `posts/2026-10-27/post.json`). Kapak başlığı en fazla 8 kelime ve soru biçiminde; tam 5 madde (reels süresi buna göre ayarlı), her madde başlığı en fazla 7 kelime, açıklama en fazla 25 kelime; son sayfada doğrulanmış 2–3 bilgi ve `note` alanında "Bilgilendirme amaçlıdır. Kaynak: ..." satırı. Abartılı vaat, korku dili, rakip firma, kişisel veri yok. Hukuki tavsiye verme.
4. **Görseller ve video (bulut çalışma alanında, bilgisayar gerekmez):**
   - `python3 tools/render_carousel.py posts/<tarih>/post.json posts/<tarih> hap-bilgi-<no>`
   - `python3 tools/render_reel.py posts/<tarih>/post.json posts/<tarih>/hap-bilgi-<no>-reels.mp4` (yaklaşık 2 dakika; komut zaman aşımını 10 dakika ver)
   - `python3 tools/render_reel.py posts/<tarih>/post.json /tmp/onizleme-reels.png --preview`
   - `posts/<tarih>/onizleme.png` ve `/tmp/onizleme-reels.png` dosyalarını Read ile aç ve kontrol et: taşan metin, kesik satır, yanlış Türkçe karakter, konuşma balonunun metnin üstüne binmesi olmamalı. Sorun varsa metni kısaltıp tekrar üret.
5. **Yükleme:** `onizleme.png` hariç sayfaları, reels videosunu ve `post.json`'u commit'le, `main`'e push et. Commit mesajı: `Hap Bilgi #<no>: <konu>`. Push sonrası `git rev-parse --short HEAD` ile commit kısaltmasını al.
6. **Zamanlama (Metricool `createScheduledPost`, blogId `7665597`, `autoPublish: true`, providers `[{"network":"instagram"},{"network":"facebook"}]`):**
   - **Reels:** tarih `<gün>T12:30:00+03:00`; media = `[<mp4 adresi>]`; `instagramData` `{"type":"REEL","collaborators":[],"showReelOnFeed":true,"isAiGenerated":false}`; `facebookData` `{"type":"REEL"}`; `videoCoverMilliseconds: 2500` (kapak: başlığın göründüğü an).
   - **Carousel:** tarih `<gün>T20:30:00+03:00`; media = 7 png adresi sırayla; `instagramData` `{"type":"POST","collaborators":[],"showReelOnFeed":true,"isAiGenerated":false}`; `facebookData` `{"type":"POST"}`.
   - Açıklama metni (ikisinde de): kapaktaki soru + 1 emoji; 2–3 kısa paragraf; "Kaydedin, apartman toplantısında lazım olacak. 📌"; "Sorularınızı yorumlara yazın, tek tek cevaplıyoruz."; "Binanız için ücretsiz ön görüşme: DM veya profildeki WhatsApp bağlantısı."; 5 hashtag (#kentseldönüşüm #bahçelievler + konuya göre #riskliyapı #katkarşılığı #6306 #bakırköy #güngören #merter #bağcılar #küçükçekmece #şişli içinden 3 tane). Reels metninin ilk cümlesi farklı olsun ("Videoyu sonuna kadar izleyin, 5. madde çok önemli." gibi).
   - Dönen id'leri `post.json`'a `metricool_id` (carousel) ve `metricool_reel_id` (reels) olarak yaz, `KONULAR.md`'de konuyu "#<no> · <tarih>" olarak işaretle, commit'le ve push et.
7. **Bildirim:** `SendUserMessage` ile kısa rapor: hangi gün, Hap Bilgi numarası, kapak başlığı, iki yayın saati, kullanılan resmi kaynak linkleri, iki Metricool `plannerUrl` ve "Değiştirmek veya iptal etmek için Metricool'da gönderiyi düzenleyin ya da bana yazın." Carousel önizlemesini ve reels önizlemesini `SendUserFile` ile ekle.

## Bilgisayar kapalıysa

Görsel ve video bulutta üretilir, ama mevzuat doğrulaması için kullanıcının bilgisayarındaki Claude tarayıcısı gerekir. Tarayıcıya ulaşılamıyorsa:
- Konu bankasında durumu boş ve **mevzuat sayısı/süresi/oranı gerektirmeyen** ilk teknik konuyu seç (örn. "Betonarme nedir?", "Net m² ve brüt m² farkı", "Kat planı nasıl okunur?"). Bu konularda yasal süre, oran, tutar veya madde numarası yazma.
- Böyle bir konu kalmadıysa o gün gönderi hazırlama; kullanıcıya "Bilgisayarınıza ulaşamadım; <tarih> gönderisi hazırlanamadı. Bilgisayarınızı açıp bana yazarsanız hazırlarım." mesajını gönder.
- Her iki durumda da bildirimde doğrulama yapılamadığını belirt.

## Hiçbir zaman

- Bir gün için birden fazla reels veya birden fazla carousel zamanlama.
- Kullanıcının oluşturduğu veya düzenlediği bir gönderiyi silme ya da değiştirme.
- DM veya yoruma kullanıcı adına cevap verme.
- Reklam başlatma, ücretli işlem yapma.
- Bu depoya gönderi dosyaları, şablon ve kayıt dışında bir şey koyma.

## Haftalık rapor (Cuma çalışmasında)

Metricool analizlerinden (getAnalyticsDataByMetrics) son 7 günün Instagram ve Facebook gönderilerinin erişim, izlenme, kaydetme ve paylaşım sayılarını al. **Reels ile carousel'i ayrı ayrı karşılaştır** (ortalama erişim, kaydetme, paylaşım, yeni takipçi); hangisinin daha iyi gittiğini, en iyi 2 konuyu ve bir sonraki haftaya bir öneriyi bildirimde yaz.
