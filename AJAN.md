# Hap bilgi ajanı: çalışma talimatı

Bu depo, @celikkayamulk Instagram hesabının otomatik hap bilgi gönderileri içindir. Ajan bu dosyayı her çalışmada baştan sona okur ve uygular. Tüm içerik Türkçe.

## Takvim

Ajan hafta içi her gün 10:00'da (Europe/Istanbul) çalışır:

| Çalışma günü | Hazırlanan gönderiler (her biri 20:30'da yayınlanır) |
| --- | --- |
| Pazartesi | Salı |
| Salı | Çarşamba |
| Çarşamba | Perşembe |
| Perşembe | Cuma |
| Cuma | Cumartesi, Pazar, Pazartesi |

Hazırlamadan önce `posts/` klasörüne ve Metricool'daki zamanlanmış gönderilere bak (getScheduledPosts, brandId `7665597`, timezone `Europe/Istanbul`). O tarih için zaten gönderi varsa o günü atla.

## Sabit bilgiler

- Metricool brand/blogId: `7665597`, ağ: instagram, hesap: @celikkayamulk
- Görsel adresi: `https://raw.githubusercontent.com/emincelikkaya/celikkaya-instagram/main/posts/<YYYY-MM-DD>/hap-bilgi-<no>-<sayfa>.png`
- Şablon: `tools/slides.js`, birleştirme: `tools/stitch.py`
- Konu listesi ve kullanım kaydı: `KONULAR.md`

## Adımlar (her gönderi için)

1. **Konu:** `KONULAR.md`'de durumu boş olan ilk konuyu al. Hap bilgi numarası = `posts/` içindeki en büyük `no` + 1.
2. **Doğrulama:** Oran, süre, tutar, madde numarası içeren her bilgiyi resmi kaynaktan doğrula: mevzuat.gov.tr (6306 sayılı Kanun: `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6306&MevzuatTur=1&MevzuatTertip=5`), resmigazete.gov.tr, csb.gov.tr. Bu siteler otomatik okumaya kapalı; kullanıcının bilgisayarındaki Claude tarayıcısıyla aç ve `javascript_tool` ile `document.body.innerText` içinde ilgili maddeyi ara. Doğrulayamadığın bilgiyi kullanma; konunun özü doğrulanamıyorsa konuyu `KONULAR.md`'de "ertelendi: <neden>" olarak işaretle ve sıradakine geç.
3. **İçerik:** `posts/<tarih>/post.json` yaz (şema: `posts/2026-10-27/post.json`). Kapak başlığı en fazla 8 kelime ve soru biçiminde; 3–5 madde, her madde başlığı en fazla 7 kelime, açıklama en fazla 30 kelime; son sayfada doğrulanmış 2–3 bilgi ve `note` alanında "Bilgilendirme amaçlıdır. Kaynak: ..." satırı. Abartılı vaat, korku dili, rakip firma, kişisel veri yok. Hukuki tavsiye verme.
4. **Görseller:** Claude tarayıcısında:
   - `resize_window` ile 540x675 ayarla.
   - `tools/slides.js` dosyasının tamamını `javascript_tool` ile çalıştır, sonra `await window.__build(<post.json içeriği>)`.
   - Her sayfa i (0'dan başlar) ve parça t (0..3) için: `await window.__show(i,t)` ardından `computer` `zoom` region `[0,0,540,675]`, `scale: 1`. (scale 1'den küçük olursa dosya da küçülür.) `browser_batch` ile sayfa başına 8 adım gönder.
   - Çekilen ilk parçayı kontrol et: görüntü ayarı oturmadan çekilirse içerik 2 kat büyük görünür. Öyleyse o parçayı yeniden çek.
   - Her zoom sonucu bir PNG yolu verir (`/root/.claude/projects/.../tool-results/...png`). Yolları sırayla not al.
   - `python3 tools/stitch.py posts/<tarih> hap-bilgi-<no> <parça yolları sırayla>` çalıştır. `onizleme.png`'yi Read ile aç ve kontrol et: taşan metin, kesik satır, yanlış Türkçe karakter olmamalı. Sorun varsa metni kısaltıp tekrar üret.
   - Bitince `resize_window` preset `desktop`.
5. **Yükleme:** `onizleme.png` hariç sayfaları ve `post.json`'u commit'le, `main`'e push et. Commit mesajı: `Hap Bilgi #<no>: <konu>`.
6. **Zamanlama:** Metricool `createScheduledPost`: blogId `7665597`, tarih `<gün>T20:30:00+03:00`, providers `[{"network":"instagram"}]`, `instagramData` `{"type":"POST","collaborators":[],"showReelOnFeed":true,"isAiGenerated":false}`, `autoPublish: true`, media = raw.githubusercontent adresleri sırayla.
   Açıklama metni: kapaktaki soru + 1 emoji; 2–3 kısa paragraf; "Kaydedin, apartman toplantısında lazım olacak. 📌"; "Sorularınızı yorumlara yazın, tek tek cevaplıyoruz."; "Binanız için ücretsiz ön görüşme: DM veya profildeki WhatsApp bağlantısı."; 5 hashtag (#kentseldönüşüm #bahçelievler + konuya göre #riskliyapı #katkarşılığı #6306 #bakırköy #güngören #merter #bağcılar #küçükçekmece #şişli içinden 3 tane).
   Dönen `id`'yi `post.json`'a `metricool_id` olarak yaz, `KONULAR.md`'de konuyu "#<no> · <tarih>" olarak işaretle, commit'le ve push et.
7. **Bildirim:** `SendUserMessage` ile kısa rapor: hangi gün, Hap Bilgi numarası, kapak başlığı, yayın saati, kullanılan resmi kaynak linkleri, Metricool `plannerUrl` ve "Değiştirmek veya iptal etmek için Metricool'da gönderiyi düzenleyin ya da bana yazın." Önizleme görselini `SendUserFile` ile ekle.

## Bilgisayar kapalıysa

Claude tarayıcısına ulaşılamıyorsa (bilgisayar kapalı ya da Claude uygulaması açık değil) görsel üretilemez ve mevzuat doğrulanamaz. O gün gönderi hazırlama; kullanıcıya "Bilgisayarınıza ulaşamadım; <tarih> gönderisi hazırlanamadı. Bilgisayarınızı açıp bana yazarsanız hazırlarım." mesajını gönder.

## Hiçbir zaman

- Aynı gün için birden fazla gönderi zamanlama.
- Kullanıcının oluşturduğu veya düzenlediği bir gönderiyi silme ya da değiştirme.
- DM veya yoruma kullanıcı adına cevap verme.
- Reklam başlatma, ücretli işlem yapma.
- Bu depoya gönderi görselleri, şablon ve kayıt dışında bir şey koyma.

## Haftalık rapor (Cuma çalışmasında)

Metricool analizlerinden (getAnalyticsDataByMetrics) son 7 günün Instagram gönderilerinin erişim, kaydetme ve paylaşım sayılarını al; en iyi 2 konuyu ve bir sonraki haftaya bir öneriyi bildirimde yaz.
