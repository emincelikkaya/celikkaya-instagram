"""post.json'dan 1080x1350 carousel sayfalarını bulut çalışma alanında üretir (bilgisayar gerekmez).

Kullanım:
  python3 tools/render_carousel.py posts/<tarih>/post.json posts/<tarih> hap-bilgi-<no>

Çıktı: posts/<tarih>/hap-bilgi-<no>-1.png ... ve onizleme.png (depoya eklenmez).
"""
import json
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
CHROME = Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")


def main():
    post = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out, prefix = Path(sys.argv[2]), sys.argv[3]
    out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=str(CHROME)) if CHROME.exists() else p.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=1)
        pg.goto((HERE / "carousel.html").as_uri())
        pg.evaluate("(src) => (0, eval)(src)", (HERE / "slides.js").read_text(encoding="utf-8"))
        info = pg.evaluate("(p) => window.__build(p)", post)
        pages = []
        for i in range(info["slides"]):
            pg.evaluate(f"window.__showFull({i})")
            pg.evaluate("document.fonts.ready")
            path = out / f"{prefix}-{i + 1}.png"
            pg.screenshot(path=str(path), clip={"x": 0, "y": 0, "width": 1080, "height": 1350})
            pages.append(path)
        b.close()
    sheet = Image.new("RGB", (len(pages) * 280 + 10, 357), "white")
    for i, pth in enumerate(pages):
        sheet.paste(Image.open(pth).resize((270, 337)), (10 + i * 280, 10))
    sheet.save(out / "onizleme.png")
    print("\n".join(str(x) for x in pages), "\nlogo:", info.get("logo"), "fonts:", info.get("fonts"))


if __name__ == "__main__":
    main()
