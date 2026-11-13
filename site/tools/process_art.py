"""Turn ChatGPT-generated images (assets/generated/chatgpt) into site art (site/img/art), with provenance."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets/generated/chatgpt"
ART = ROOT / "site/img/art"
TEX = ROOT / "site/img/texture"
ART.mkdir(parents=True, exist_ok=True)
prov_path = ROOT / "site/img/provenance.json"
prov = json.loads(prov_path.read_text())
manifest = {}
if (SRC / "manifest.json").exists():
    for m in json.loads((SRC / "manifest.json").read_text()):
        manifest[Path(m.get("file", "")).name] = m


def record(rel, src, note):
    m = manifest.get(src.name, {})
    prov[rel] = {"source": str(src.relative_to(ROOT)).replace("\\", "/"), "note": note,
                 "prompt": m.get("prompt"), "reference": m.get("reference"), "generator": "ChatGPT image generation (client account)"}


def key_green(im):
    a = np.asarray(im.convert("RGB")).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = np.clip(1 - (greenness - 40) / 80, 0, 1)
    # de-spill: pull green toward the other channels where partially keyed
    g2 = np.where(greenness > 0, np.maximum(r, b) + (g - np.maximum(r, b)) * alpha * 0.3, g)
    out = np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)
    o = Image.fromarray(out, "RGBA")
    return o.crop(o.getbbox())


def key_white_ink(im):
    a = np.asarray(im.convert("RGB")).astype(float)
    lum = a @ [0.299, 0.587, 0.114]
    alpha = np.clip((245 - lum) / 120, 0, 1)
    out = np.zeros((*lum.shape, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = 164, 46, 40   # madder ink
    out[..., 3] = (alpha * 255).astype(np.uint8)
    o = Image.fromarray(out, "RGBA")
    return o.crop(o.getbbox())


done = []
for f in sorted(SRC.glob("*.png")) + sorted(SRC.glob("*.jpg")) + sorted(SRC.glob("*.webp")):
    stem = f.stem
    im = Image.open(f)
    if stem.startswith("illus-") or stem in ("story-adda-hands", "studio-sketchbook"):
        name = {"story-adda-hands": "adda-hands", "studio-sketchbook": "studio-sketchbook"}.get(stem, stem)
        o = im.convert("RGB"); o.thumbnail((1400, 1400), Image.LANCZOS)
        o.save(ART / f"{name}.webp", "WEBP", quality=84)
        record(f"art/{name}.webp", f, "AI illustration generated from the client's own garment photo")
        done.append(name)
    elif stem == "peg":
        o = key_green(im); o.thumbnail((240, 240), Image.LANCZOS)
        # orient the peg vertically (long side up)
        if o.width > o.height:
            o = o.rotate(90, expand=True)
        o.save(ART / "peg.webp", "WEBP", quality=90)
        record("art/peg.webp", f, "AI wooden peg, chroma-keyed")
        done.append("peg")
    elif stem == "care-label":
        o = key_green(im)
        o.convert("RGBA").save(TEX / "care-label.webp", "WEBP", quality=86)
        record("texture/care-label.webp", f, "AI blank woven care label, chroma-keyed")
        done.append("care-label")
    elif stem.startswith("stamp-"):
        o = key_white_ink(im); o.thumbnail((900, 900), Image.LANCZOS)
        o.save(ART / f"{stem}.webp", "WEBP", quality=90)
        record(f"art/{stem}.webp", f, "AI rubber-stamp impression, keyed to madder ink")
        done.append(stem)

prov_path.write_text(json.dumps(prov, indent=1))
print("processed:", done)
