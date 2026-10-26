import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { HapBilgiReel, sceneTimes } from './Reel';

const FPS = 30;

// Önizleme için örnek içerik. Gerçek üretimde --props=posts/<tarih>/post.json verilir;
// post.json'un içeriği doğrudan bileşenin props'u olur.
const ornek = {
  no: 1,
  cover: { title: 'Binanız kentsel dönüşüme girebilir mi?', subtitle: '5 soruda kendinizi test edin' },
  items: [
    { h: 'Binanız 1999dan önce mi yapıldı?', p: 'Örnek açıklama.' },
    { h: 'Kolon ve kirişlerde çatlak var mı?', p: 'Örnek açıklama.' },
  ],
  last: { title: 'Örnek kapanış', accent: 'kapanış', bullets: ['Örnek bilgi'], note: 'Bilgilendirme amaçlıdır.' },
};

const Root = () => (
  <Composition
    id="HapBilgiReel"
    component={HapBilgiReel}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={Math.round(sceneTimes(ornek).duration * FPS)}
    defaultProps={ornek}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.round(sceneTimes(props).duration * FPS),
    })}
  />
);

registerRoot(Root);
