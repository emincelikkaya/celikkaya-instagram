"""post.json'dan 1080x1920 hap bilgi reels videosu üretir.

Kullanım:
  python3 tools/render_reel.py posts/<tarih>/post.json posts/<tarih>/hap-bilgi-<no>-reels.mp4 [--fps 30] [--preview]

Bulut çalışma alanında çalışır (Playwright + Chromium + ffmpeg); kullanıcının bilgisayarına gerek yoktur.
--preview: video yerine 6 kare içeren onizleme-reels.png üretir.
"""
import argparse
import json
import math
import struct
import subprocess
import tempfile
import wave
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent


def make_audio(path, duration, cues, rate=44100):
    """Sahne geçişlerinde kısa 'pop' sesi ve hafif bir ritim içeren ses izi."""
    n = int(duration * rate)
    buf = [0.0] * n

    def add(start, length, fn):
        s = int(start * rate)
        for k in range(int(length * rate)):
            if 0 <= s + k < n:
                buf[s + k] += fn(k / rate)

    for c in cues:  # pop: hızlı inen ton
        add(c, 0.14, lambda x: 0.55 * math.sin(2 * math.pi * (900 - 2600 * x) * x) * math.exp(-x * 30))
    beat = 60 / 112  # yumuşak tempo
    t = 0.0
    while t < duration - 0.2:
        add(t, 0.18, lambda x: 0.22 * math.sin(2 * math.pi * 58 * x) * math.exp(-x * 18))
        add(t + beat / 2, 0.05, lambda x: 0.05 * math.sin(2 * math.pi * 3200 * x) * math.exp(-x * 90))
        t += beat
    peak = max(1e-9, max(abs(v) for v in buf))
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(b"".join(struct.pack("<h", int(32000 * v / peak * 0.8)) for v in buf))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("post")
    ap.add_argument("out")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--preview", action="store_true")
    a = ap.parse_args()
    post = json.loads(Path(a.post).read_text(encoding="utf-8"))
    out = Path(a.out)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome") if Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome").exists() else p.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        pg.goto((HERE / "reel.html").as_uri())
        pg.evaluate("document.fonts.ready")
        info = pg.evaluate("(p) => window.setup(p)", post)
        pg.evaluate("document.fonts.ready")
        dur, cues = info["duration"], info["cues"]
        stage = pg.locator("#stage")
        if a.preview:
            from PIL import Image
            import io
            times = [0.4, 1.6, cues[1] + 2.0, cues[2] + 2.0, cues[-1] + 0.6, dur - 0.3]
            shots = []
            for t in times:
                pg.evaluate(f"window.render({t})")
                shots.append(Image.open(io.BytesIO(stage.screenshot())).resize((270, 480)))
            sheet = Image.new("RGB", (len(shots) * 280 + 10, 500), "white")
            for i, im in enumerate(shots):
                sheet.paste(im, (10 + i * 280, 10))
            sheet.save(out)
            print(out, dur)
            return
        with tempfile.TemporaryDirectory() as td:
            wav = Path(td) / "a.wav"
            make_audio(wav, dur, cues)
            frames = int(dur * a.fps)
            ff = subprocess.Popen([
                "ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(a.fps), "-c:v", "png", "-i", "-",
                "-i", str(wav), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
            for f in range(frames):
                pg.evaluate(f"window.render({f / a.fps})")
                ff.stdin.write(stage.screenshot(type="png"))
            ff.stdin.close()
            ff.wait()
        b.close()
    print(out, round(dur, 1), "sn")


if __name__ == "__main__":
    main()
