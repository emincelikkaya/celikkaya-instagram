// Çelikkaya hap bilgi carousel şablonu.
// Kullanım: Claude tarayıcısında (javascript_tool) bu dosyanın tamamını çalıştır,
// ardından: await window.__build(POST);  ve her sayfa/parça için: await window.__show(sayfa, parca)
// Görünüm 540x675 olmalı (resize_window). Her sayfa 4 parça (0..3) halinde 540x675 çekilir.
//
// POST örneği:
// {
//   "no": 2,
//   "cover": {"title": "Riskli yapı tespiti nasıl yapılır?", "subtitle": "Adım adım süreç"},
//   "items": [ {"h": "Kısa başlık", "p": "En fazla 30 kelimelik açıklama."}, ... 3-5 adet ],
//   "last": {"title": "Özet cümlesi", "accent": "vurgulanacak kelime (title içinde geçmeli, opsiyonel)",
//            "bullets": ["doğrulanmış bilgi 1", "doğrulanmış bilgi 2"],
//            "note": "Bilgilendirme amaçlıdır. Kaynak: ..."}
// }
(() => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const F = '<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Libre+Franklin:wght@400;500;600&display=block" rel="stylesheet">';
  const foot = (dark) => `<div style="position:absolute;left:0;right:0;bottom:0;height:132px;box-sizing:border-box;padding:0 88px;border-top:3px solid #CBAA7F;background:${dark ? '#0E0F0F' : '#151616'};display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:18px"><div style="width:60px;height:60px;box-sizing:border-box;border:3px solid #CBAA7F;display:flex;align-items:center;justify-content:center;font-family:Rajdhani;font-weight:700;font-size:32px;letter-spacing:-1px;color:#CBAA7F">ÇK</div><div style="font-family:Rajdhani;font-weight:600;font-size:34px;letter-spacing:8px"><span style="color:#F6F2EC">ÇELİK</span><span style="color:#CBAA7F">KAYA</span></div></div><div style="font-family:Rajdhani;font-weight:600;font-size:28px;letter-spacing:1px;color:#F6F2EC">@celikkayamulk</div></div>`;
  const tag = (no, n, total, light) => `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-family:Rajdhani;font-weight:700;font-size:30px;letter-spacing:6px;color:${light ? '#8A6A3E' : '#CBAA7F'}">HAP BİLGİ #${no}</div><div style="font-family:Rajdhani;font-weight:600;font-size:30px;letter-spacing:2px;color:${light ? '#5C5A56' : '#CFCAC2'}">${n} / ${total}</div></div>`;
  const cover = (P) => `<div style="position:relative;width:1080px;height:1350px;background:#151616;overflow:hidden;color:#F6F2EC;font-family:'Libre Franklin'">
<div style="position:absolute;right:-140px;top:150px;width:560px;height:560px;border:6px solid #CBAA7F;opacity:.22"></div>
<div style="position:absolute;left:88px;right:88px;top:88px;display:flex;align-items:center;gap:24px"><div style="width:64px;height:4px;background:#CBAA7F"></div><div style="font-family:Rajdhani;font-weight:700;font-size:32px;letter-spacing:6px;color:#CBAA7F">HAP BİLGİ #${P.no}</div></div>
<div style="position:absolute;left:88px;right:88px;top:330px"><div style="font-family:Rajdhani;font-weight:700;font-size:116px;line-height:.98;letter-spacing:-2px">${esc(P.cover.title)}</div><div style="margin-top:40px;font-family:Rajdhani;font-weight:600;font-size:62px;line-height:1.05;color:#CBAA7F">${esc(P.cover.subtitle)}</div></div>
<div style="position:absolute;left:88px;bottom:196px;display:flex;align-items:center;gap:16px;font-size:30px;font-weight:500;color:#CFCAC2">Kaydırın <svg width="56" height="24" viewBox="0 0 56 24" fill="none" stroke="#CFCAC2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h50M42 3l10 9-10 9"/></svg></div>${foot(true)}</div>`;
  const item = (P, n, total, num, it) => `<div style="position:relative;width:1080px;height:1350px;background:#F6F2EC;overflow:hidden;color:#151616;font-family:'Libre Franklin'"><div style="position:absolute;left:88px;right:88px;top:88px">${tag(P.no, n, total, true)}</div>
<div style="position:absolute;left:88px;right:88px;top:280px"><div style="font-family:Rajdhani;font-weight:700;font-size:220px;line-height:.8;color:#CBAA7F">${num}</div><div style="margin-top:44px;font-family:Rajdhani;font-weight:700;font-size:92px;line-height:1;letter-spacing:-1px">${esc(it.h)}</div><div style="margin-top:44px;width:96px;height:4px;background:#151616"></div><div style="margin-top:44px;max-width:840px;font-size:38px;line-height:1.45;color:#3A3936">${esc(it.p)}</div></div>
<div style="position:absolute;left:88px;bottom:196px;display:flex;align-items:center;gap:16px;font-size:28px;font-weight:500;color:#5C5A56"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5C5A56" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>Kaydedin, toplantıda lazım olacak</div>${foot(false)}</div>`;
  const last = (P, total) => {
    let t = esc(P.last.title);
    if (P.last.accent) t = t.replace(esc(P.last.accent), `<span style="color:#CBAA7F">${esc(P.last.accent)}</span>`);
    const bl = (P.last.bullets || []).map((b) => `<div style="display:flex;gap:22px"><div style="flex:none;width:14px;height:14px;margin-top:14px;background:#CBAA7F"></div><div>${esc(b)}</div></div>`).join('');
    return `<div style="position:relative;width:1080px;height:1350px;background:#151616;overflow:hidden;color:#F6F2EC;font-family:'Libre Franklin'"><div style="position:absolute;left:88px;right:88px;top:88px">${tag(P.no, total, total, false)}</div>
<div style="position:absolute;left:88px;right:88px;top:250px"><div style="font-family:Rajdhani;font-weight:700;font-size:86px;line-height:1;letter-spacing:-1px">${t}</div>
<div style="margin-top:56px;display:flex;flex-direction:column;gap:26px;font-size:34px;line-height:1.35">${bl}</div>
<div style="margin-top:56px;display:inline-block;background:#CBAA7F;color:#151616;padding:20px 30px;font-family:Rajdhani;font-weight:700;font-size:38px">Binanız için ücretsiz ön görüşme: DM</div>
<div style="margin-top:28px;font-size:22px;line-height:1.4;color:#A8A49C">${esc(P.last.note || '')}</div></div>${foot(true)}</div>`;
  };
  window.__build = async (P) => {
    const total = P.items.length + 2;
    window.__slides = [cover(P), ...P.items.map((it, i) => item(P, i + 2, total, String(i + 1).padStart(2, '0'), it)), last(P, total)];
    document.open();
    document.write('<!doctype html><html><head><meta charset="utf-8">' + F + '<style>html,body{margin:0;overflow:hidden;background:#000}</style></head><body></body></html>');
    document.close();
    const g = 'ÇşğİÖüıâ';
    await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 20px "Libre Franklin"`, g)));
    await Promise.all(['600', '700'].map((w) => document.fonts.load(`${w} 20px Rajdhani`, g)));
    return { slides: window.__slides.length, fonts: [...document.fonts].filter((f) => f.status === 'loaded').length };
  };
  window.__show = async (i, t) => {
    const x = (t % 2) * 540, y = Math.floor(t / 2) * 675;
    document.body.innerHTML = `<div style="position:fixed;left:${-x}px;top:${-y}px">${window.__slides[i]}</div>`;
    await new Promise((r) => setTimeout(r, 300));
    return `${i}-${t}`;
  };
  return 'slides.js hazır';
})();
