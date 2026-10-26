"""Reels ses izi: sahne geçişlerinde 'pop' + hafif ritim. Remotion üretimi için.

Kullanım: python3 tools/reel_audio.py posts/<tarih>/post.json remotion/public/audio.wav
Süre/sahne formülü remotion/src/Reel.jsx'teki sceneTimes ile aynıdır.
"""
import json
import math
import struct
import sys
import wave

HOOK, ITEM, OUT = 3.0, 4.2, 4.8


def main():
    post = json.load(open(sys.argv[1], encoding="utf-8"))
    n_items = len(post.get("items", []))
    duration = HOOK + n_items * ITEM + OUT
    cues = [0.05] + [HOOK + i * ITEM + 0.05 for i in range(n_items)] + [HOOK + n_items * ITEM + 0.05]
    rate = 44100
    n = int(duration * rate)
    buf = [0.0] * n

    def add(start, length, fn):
        s = int(start * rate)
        for k in range(int(length * rate)):
            if 0 <= s + k < n:
                buf[s + k] += fn(k / rate)

    for c in cues:
        add(c, 0.14, lambda x: 0.55 * math.sin(2 * math.pi * (900 - 2600 * x) * x) * math.exp(-x * 30))
    beat, t = 60 / 112, 0.0
    while t < duration - 0.2:
        add(t, 0.18, lambda x: 0.22 * math.sin(2 * math.pi * 58 * x) * math.exp(-x * 18))
        add(t + beat / 2, 0.05, lambda x: 0.05 * math.sin(2 * math.pi * 3200 * x) * math.exp(-x * 90))
        t += beat
    peak = max(1e-9, max(abs(v) for v in buf))
    with wave.open(sys.argv[2], "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(b"".join(struct.pack("<h", int(32000 * v / peak * 0.8)) for v in buf))
    print(sys.argv[2], round(duration, 1), "sn")


if __name__ == "__main__":
    main()
