// Çelikkaya hap bilgi reels videosu (Remotion). tools/reel.html ile aynı kurgu:
// 3 sn kanca, madde başına 4,2 sn, 4,8 sn kapanış; karakterli, ilerleme çubuklu.
import React from 'react';
import {
  AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

// ---- fontlar (public/fonts) ----
const fontHandle = delayRender('fontlar yükleniyor');
const fontList = [
  ['Rajdhani', 'fonts/Rajdhani-SemiBold.ttf', '600'],
  ['Rajdhani', 'fonts/Rajdhani-Bold.ttf', '700'],
  ['Libre Franklin', 'fonts/LibreFranklin-VF.ttf', '100 900'],
];
Promise.all(fontList.map(([family, file, weight]) => {
  const f = new FontFace(family, `url(${staticFile(file)})`, { weight });
  return f.load().then((loaded) => document.fonts.add(loaded));
})).then(() => continueRender(fontHandle)).catch((e) => { console.error(e); continueRender(fontHandle); });

// ---- yardımcılar ----
const HOOK = 3.0, ITEM = 4.2, OUT = 4.8;
export const sceneTimes = (P) => {
  const scenes = [{ type: 'hook', start: 0, dur: HOOK }];
  (P.items || []).forEach((_, i) => scenes.push({ type: 'item', i, start: HOOK + i * ITEM, dur: ITEM }));
  scenes.push({ type: 'outro', start: HOOK + (P.items || []).length * ITEM, dur: OUT });
  return { scenes, duration: HOOK + (P.items || []).length * ITEM + OUT };
};
const clamp = (x) => Math.min(Math.max(x, 0), 1);
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const back = (x) => { const v = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };

const GOLD = '#CBAA7F', INK = '#151616', CREAM = '#F6F2EC';
const R = { fontFamily: 'Rajdhani' };

const Words = ({ text, t, per }) => (
  <>
    {String(text).split(' ').map((w, k) => {
      const a = ease((t - k * per) / 0.25);
      return (
        <span key={k} style={{ display: 'inline-block', opacity: a, transform: `translateY(${(1 - a) * 40}px)`, marginRight: '0.25em' }}>{w}</span>
      );
    })}
  </>
);

// Kelime kelime vurgulanan altyazı (karaoke): okunan kelime altın zeminli, okunmuşlar koyu, sıradakiler soluk.
const Karaoke = ({ text, t, per, color, dim }) => {
  const words = String(text).split(' ');
  const cur = Math.floor(t / per);
  return (
    <>
      {words.map((w, k) => {
        const active = k === cur;
        const seen = k < cur;
        const pop = active ? back((t - k * per) / 0.18) : 1;
        return (
          <span key={k} style={{
            display: 'inline-block', marginRight: '0.28em', marginBottom: '0.12em', padding: '0 0.12em', borderRadius: 8,
            background: active ? GOLD : 'transparent', color: active ? INK : color,
            opacity: t < 0 ? 0 : (seen || active ? 1 : dim), transform: `scale(${active ? 0.9 + 0.1 * pop : 1})`,
          }}>{w}</span>
        );
      })}
    </>
  );
};

// Sahne geçişi: altın-antrasit eğik panel ekranı süpürür; sahne değişimi panelin arkasında olur.
const Wipe = ({ t, boundaries }) => {
  const W = 0.32;
  const b = boundaries.find((x) => Math.abs(t - x) < W);
  if (b === undefined) return null;
  const p = (t - b + W) / (2 * W); // 0..1
  const x = -160 + p * 320; // yüzde
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: -200, bottom: -200, left: `${x}%`, width: '140%', transform: 'skewX(-14deg)', display: 'flex' }}>
        <div style={{ width: 90, background: INK }} />
        <div style={{ flex: 1, background: GOLD }} />
        <div style={{ width: 90, background: INK }} />
      </div>
    </div>
  );
};

// Kapanışta madde işaretleri: çizilerek beliren onay işareti.
const Check = ({ p }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ flex: 'none', marginTop: 4 }}>
    <circle cx="20" cy="20" r="18" fill={GOLD} opacity={ease(p * 2)} />
    <path d="M11 21 L17 27 L29 14" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="30" strokeDashoffset={30 * (1 - ease((p - 0.3) / 0.7))} />
  </svg>
);

const Accent = ({ text, accent }) => {
  if (!accent || !text.includes(accent)) return <>{text}</>;
  const [a, b] = text.split(accent);
  return <>{a}<span style={{ color: GOLD }}>{accent}</span>{b}</>;
};

// ---- karakter ----
const Character = ({ t, s, lt }) => {
  const enter = s.type === 'hook' ? back((lt - 0.3) / 0.6) : 1;
  const bob = Math.sin(t * 3.2) * 8;
  const blink = (t % 3.1) < 0.12 ? 0.1 : 1;
  const talking = (s.type === 'hook' && lt > 0.8 && lt < 2.8) || (s.type === 'item' && lt > 0.3 && lt < 2.4) || (s.type === 'outro' && lt > 0.4 && lt < 2.6);
  const mouthRy = talking ? 6 + Math.abs(Math.sin(t * 18)) * 18 : 6;
  const surprised = s.type === 'hook' && lt > 0.6 && lt < 1.6;
  const browY = surprised ? 204 : 222;
  const headRot = Math.sin(t * 2) * 3 + (talking ? Math.sin(t * 9) * 2 : 0);
  const arm = s.type === 'item' ? -10 + Math.sin(lt * 6) * 4 : (s.type === 'hook' ? Math.sin(t * 10) * 18 : 20 * Math.sin(t * 8));
  return (
    <svg width="440" height="640" viewBox="0 0 440 640"
      style={{ position: 'absolute', left: 40, top: 1080, overflow: 'visible', transform: `translateY(${(1 - enter) * 700 + bob}px)` }}>
      <path d="M95 420 Q220 360 345 420 L370 640 L70 640 Z" fill="#2B2D2D" />
      <rect x="92" y="500" width="256" height="22" fill={GOLD} />
      <path d="M105 430 Q60 500 80 590" stroke="#2B2D2D" strokeWidth="46" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="592" r="26" fill="#F2C9A0" />
      <g style={{ transformOrigin: '330px 440px', transform: `rotate(${arm}deg)` }}>
        <path d="M330 440 Q400 380 420 300" stroke="#2B2D2D" strokeWidth="46" fill="none" strokeLinecap="round" />
        <circle cx="422" cy="292" r="28" fill="#F2C9A0" />
        <rect x="414" y="236" width="16" height="50" rx="8" fill="#F2C9A0" />
      </g>
      <g style={{ transformOrigin: '220px 300px', transform: `rotate(${headRot}deg)` }}>
        <ellipse cx="220" cy="270" rx="120" ry="130" fill="#F2C9A0" />
        <ellipse cx="102" cy="280" rx="18" ry="26" fill="#E8B88C" />
        <ellipse cx="338" cy="280" rx="18" ry="26" fill="#E8B88C" />
        <rect x="148" y={browY} width="44" height="10" rx="5" fill="#3A2A1E" />
        <rect x="248" y={browY} width="44" height="10" rx="5" fill="#3A2A1E" />
        <g style={{ transformOrigin: '220px 262px', transform: `scaleY(${blink})` }}>
          <ellipse cx="170" cy="262" rx="14" ry="18" fill={INK} />
          <ellipse cx="270" cy="262" rx="14" ry="18" fill={INK} />
          <circle cx="175" cy="255" r="5" fill="#fff" />
          <circle cx="275" cy="255" r="5" fill="#fff" />
        </g>
        <path d="M168 318 Q220 296 272 318 Q244 332 220 322 Q196 332 168 318 Z" fill="#3A2A1E" />
        <ellipse cx="220" cy="345" rx="26" ry={mouthRy} fill="#7A2E22" />
        <path d="M92 222 Q100 110 220 104 Q340 110 348 222 Z" fill={GOLD} />
        <rect x="70" y="212" width="300" height="26" rx="13" fill="#B8935F" />
        <rect x="206" y="104" width="28" height="112" rx="10" fill="#B8935F" />
      </g>
    </svg>
  );
};

const BUBBLES = ['Buna dikkat!', 'Şuna bakın:', 'Önemli!', 'Kaçırmayın:', 'Son olarak:'];

// ---- ana bileşen ----
export const HapBilgiReel = (P) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { scenes } = sceneTimes(P);
  const s = scenes.find((x) => t >= x.start && t < x.start + x.dur) || scenes[scenes.length - 1];
  const lt = t - s.start;
  const dark = s.type !== 'item';

  // içerik
  let content = null;
  if (s.type === 'hook') {
    const pop = back(lt / 0.45);
    const shake = lt > 0.45 && lt < 0.9 ? Math.sin(lt * 80) * 8 : 0;
    content = (
      <>
        <div style={{ ...R, display: 'inline-block', background: GOLD, color: INK, fontWeight: 700, fontSize: 96, padding: '6px 28px', letterSpacing: 6, transform: `scale(${pop}) translateX(${shake}px)`, transformOrigin: 'left center' }}>DİKKAT!</div>
        <div style={{ ...R, marginTop: 60, fontWeight: 700, fontSize: 118, lineHeight: 0.98, letterSpacing: -2, color: CREAM }}><Words text={P.cover.title} t={lt - 0.6} per={0.12} /></div>
        <div style={{ ...R, marginTop: 40, fontWeight: 600, fontSize: 60, color: GOLD, opacity: ease((lt - 1.8) / 0.4) }}>{P.cover.subtitle}</div>
      </>
    );
  } else if (s.type === 'item') {
    const it = P.items[s.i];
    const nIn = back(lt / 0.4);
    content = (
      <>
        <div style={{ ...R, fontWeight: 700, fontSize: 300, lineHeight: 0.8, color: GOLD, transformOrigin: 'left bottom', transform: `translateX(${(1 - nIn) * -400}px) scale(${1 + 0.25 * Math.max(0, 1 - lt / 0.5)})` }}>{String(s.i + 1).padStart(2, '0')}</div>
        <div style={{ ...R, marginTop: 50, fontWeight: 700, fontSize: 100, lineHeight: 1, letterSpacing: -1, color: INK }}><Words text={it.h} t={lt - 0.25} per={0.1} /></div>
        <div style={{ marginTop: 46, width: 120, height: 6, background: INK, transform: `scaleX(${ease((lt - 0.8) / 0.3)})`, transformOrigin: 'left' }} />
        {(() => {
          const n = String(it.p).split(' ').length;
          const per = Math.min(0.24, 2.7 / Math.max(n, 1));
          return <div style={{ marginTop: 40, fontSize: 48, lineHeight: 1.35, fontWeight: 500 }}><Karaoke text={it.p} t={lt - 1.0} per={per} color="#2A2A28" dim={0.22} /></div>;
        })()}
      </>
    );
  } else {
    const pulse = lt > 2 ? 1 + Math.max(0, Math.sin((lt - 2) * 6)) * 0.06 : 1;
    content = (
      <>
        <div style={{ ...R, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: -1, color: CREAM, opacity: ease(lt / 0.4), transform: `translateY(${(1 - ease(lt / 0.4)) * 40}px)` }}><Accent text={P.last.title} accent={P.last.accent} /></div>
        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {(P.last.bullets || []).map((b, k) => (
            <div key={k} style={{ display: 'flex', gap: 22, fontSize: 40, lineHeight: 1.3, color: CREAM, opacity: ease((lt - 0.8 - k * 0.4) / 0.3), transform: `translateX(${(1 - ease((lt - 0.8 - k * 0.4) / 0.4)) * 60}px)` }}>
              <Check p={(lt - 0.8 - k * 0.4) / 0.6} /><div>{b}</div>
            </div>
          ))}
        </div>
        <div style={{ ...R, marginTop: 64, display: 'inline-block', background: GOLD, color: INK, padding: '22px 36px', fontWeight: 700, fontSize: 52, transform: `scale(${pulse * ease((lt - 1.8) / 0.3)})`, transformOrigin: 'left center' }}>KAYDET + TAKİP ET</div>
        <div style={{ marginTop: 30, fontSize: 28, color: '#A8A49C', opacity: ease((lt - 2.2) / 0.4) }}>{P.last.note || ''}</div>
      </>
    );
  }

  let bubble = 'Bunu bilmeyen kalmasın!';
  if (s.type === 'item') bubble = BUBBLES[s.i % 5];
  if (s.type === 'outro') bubble = 'Kaydedin, lazım olacak!';
  const bIn = back((lt - (s.type === 'hook' ? 0.9 : 0.15)) / 0.35);

  return (
    <AbsoluteFill style={{ background: dark ? INK : CREAM, fontFamily: 'Libre Franklin', overflow: 'hidden' }}>
      <Audio src={staticFile('audio.wav')} />
      {/* inşaat şeridi */}
      <div style={{ position: 'absolute', left: -200, right: -200, top: 1720, height: 90, transform: 'rotate(-4deg)', opacity: s.type === 'item' ? 0 : 1,
        background: `repeating-linear-gradient(90deg, ${GOLD} 0 60px, ${INK} 60px 120px)`, backgroundPosition: `${-t * 120}px 0` }} />
      {/* ilerleme çubuğu */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 110, height: 10, display: 'flex', gap: 10, opacity: s.type === 'hook' ? 0 : 1 }}>
        {P.items.map((_, i) => {
          const it = scenes[i + 1];
          const f = clamp((t - it.start) / it.dur);
          return <div key={i} style={{ flex: 1, background: dark ? 'rgba(255,255,255,.25)' : 'rgba(21,22,22,.15)', borderRadius: 5, overflow: 'hidden' }}><div style={{ height: '100%', width: `${f * 100}%`, background: GOLD }} /></div>;
        })}
      </div>
      <div style={{ ...R, position: 'absolute', left: 60, top: 150, fontWeight: 700, fontSize: 38, letterSpacing: 8, color: dark ? GOLD : '#8A6A3E' }}>HAP BİLGİ #{P.no}</div>
      <Img src={staticFile(dark ? 'logo-acik.png' : 'logo.png')} style={{ position: 'absolute', right: 60, top: 138, height: 58, opacity: s.type === 'outro' ? 0 : 0.92 }} />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 300 }}>{content}</div>
      <Character t={t} s={s} lt={lt} />
      <div style={{ ...R, position: 'absolute', left: 440, top: 1250, maxWidth: 520, background: '#fff', color: INK, borderRadius: 28, padding: '22px 30px', fontWeight: 700, fontSize: 44, lineHeight: 1.05, transformOrigin: '0% 100%', transform: `scale(${Math.max(bIn, 0)})`, opacity: bIn > 0.02 ? 1 : 0 }}>{bubble}</div>
      <Wipe t={t} boundaries={scenes.slice(1).map((x) => x.start)} />
      {s.type === 'outro' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#0E0F0F', borderTop: `4px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px', opacity: ease((lt - 1) / 0.4) }}>
          <Img src={staticFile('logo-acik.png')} style={{ height: 96 }} />
          <div style={{ ...R, fontWeight: 600, fontSize: 36, color: CREAM }}>@celikkayamulk</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
