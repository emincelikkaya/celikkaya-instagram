"""Carousel kapağından 1080x1920 Instagram hikâyesi üretir.

Kullanım: python3 tools/render_story.py posts/<tarih> hap-bilgi-<no>
Çıktı: posts/<tarih>/hap-bilgi-<no>-hikaye.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

T = Path(__file__).resolve().parent
GOLD, INK, CREAM, GREY = (203, 170, 127), (21, 22, 22), (246, 242, 236), (168, 164, 156)


def main():
    d_, prefix = Path(sys.argv[1]), sys.argv[2]
    bold = ImageFont.truetype(str(T / "fonts/Rajdhani-Bold.ttf"), 64)
    semi = ImageFont.truetype(str(T / "fonts/Rajdhani-SemiBold.ttf"), 44)
    im = Image.new("RGB", (1080, 1920), INK)
    d = ImageDraw.Draw(im)
    cov = Image.open(d_ / f"{prefix}-1.png").convert("RGB").resize((864, 1080), Image.LANCZOS)
    im.paste(cov, (108, 360))
    d.rectangle((108, 360, 971, 1439), outline=GOLD, width=4)

    def ctext(y, t, f, c):
        d.text(((1080 - d.textlength(t, font=f)) / 2, y), t, font=f, fill=c)

    ctext(200, "YENİ HAP BİLGİ", bold, GOLD)
    ctext(1500, "Profilimizde 7 sayfada okuyun", semi, CREAM)
    ctext(1570, "Kaydedin, toplantıda lazım olacak", semi, GREY)
    logo = Image.open(T / "logo-acik.png").convert("RGBA").resize((405, 97), Image.LANCZOS)
    im.paste(logo, ((1080 - 405) // 2, 1740), logo)
    out = d_ / f"{prefix}-hikaye.png"
    im.save(out)
    print(out)


if __name__ == "__main__":
    main()
