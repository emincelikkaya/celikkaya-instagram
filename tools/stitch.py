"""Ekran görüntüsü parçalarını 1080x1350 carousel sayfalarına birleştirir.

Kullanım:
  python3 tools/stitch.py <çıktı_klasörü> <dosya_öneki> parca1.png parca2.png ...

Parçalar sırayla verilir: sayfa 1'in 4 parçası (sol üst, sağ üst, sol alt, sağ alt),
sonra sayfa 2'nin 4 parçası, ... Her parça 540x675 olmalı.
Çıktı: <çıktı_klasörü>/<önek>-1.png, -2.png, ... ve onizleme.png
"""
import sys
from pathlib import Path

from PIL import Image


def main():
    out, prefix, tiles = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
    if len(tiles) % 4:
        sys.exit(f"parça sayısı 4'ün katı olmalı, {len(tiles)} verildi")
    out.mkdir(parents=True, exist_ok=True)
    pages = []
    for s in range(len(tiles) // 4):
        canvas = Image.new("RGB", (1080, 1350))
        for k in range(4):
            im = Image.open(tiles[s * 4 + k]).convert("RGB")
            if im.size != (540, 675):
                sys.exit(f"{tiles[s * 4 + k]} boyutu {im.size}, 540x675 olmalı")
            canvas.paste(im, ((k % 2) * 540, (k // 2) * 675))
        path = out / f"{prefix}-{s + 1}.png"
        canvas.save(path, optimize=True)
        pages.append(path)
    sheet = Image.new("RGB", (len(pages) * 280 + 10, 357), "white")
    for i, p in enumerate(pages):
        sheet.paste(Image.open(p).resize((270, 337)), (10 + i * 280, 10))
    sheet.save(out / "onizleme.png")
    print("\n".join(str(p) for p in pages))


if __name__ == "__main__":
    main()
