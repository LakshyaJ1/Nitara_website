"""Build site/index.html from src/index.template.html.

Inlines the traced nitara logo (fill + stitch layers) and the pegged lookbook line, and resolves
data-fallback images whose art file has not been produced yet.
Run: python site/tools/build.py
"""
import html
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
tpl = (SITE / "src/index.template.html").read_text(encoding="utf-8")
svg = (SITE / "img/nitara-logo-traced.svg").read_text(encoding="utf-8")
paths = re.findall(r'<path d="([^"]+)"[^>]*?transform="([^"]+)"', svg)

fill = "".join(f'<path d="{d}" transform="{t}"/>' for d, t in paths)
fill = f'<g fill="currentColor">{fill}</g>'

thread = "".join(f'<path class="s-thread" d="{d}" transform="{t}"/>' for d, t in paths)
satin = "".join(f'<path d="{d}" transform="{t}"/>' for d, t in paths)
stitch = (
    '<defs><clipPath id="stitch-clip"><rect data-stitch-clip x="0" y="-20" width="1600" height="440"/></clipPath></defs>'
    f'<g class="s-satin" fill="url(#satin)">{satin}</g>'
    f'<g class="s-threads" clip-path="url(#stitch-clip)">{thread}</g>'
    '<circle class="s-needle" r="7" cx="0" cy="200" data-stitch-needle/>'
)


def exists(rel):
    return (SITE / rel).exists()


looks = json.loads((SITE / "img/looks.json").read_text())
order = ["nit72118", "nit72159", "nit72120", "nit72183", "nit72121", "nit72228", "nit72187-b",
         "nit72184", "nit72226", "nit72156", "nit72198", "nit72148", "nit72186-b", "nit72189-b",
         "nit72182", "nit72199", "nit7224", "nit72155", "nit72186", "nit72187", "nit72189",
         "nit72151", "nit72198-b", "nit72159-b"]
by_stem = {Path(l["img"]).stem: l for l in looks}
peg = '<img class="print__peg" src="img/art/peg.webp" alt="" aria-hidden="true">' if exists("img/art/peg.webp") else '<span class="print__peg print__peg--css" aria-hidden="true"></span>'
items = []
if exists("img/video/onset-eyelet.mp4"):
    items.append(
        '<li class="print print--film" style="--tilt:-1.4deg"><div class="print__btn">' + peg +
        '<span class="print__paper"><span class="print__photo">'
        '<video src="img/video/onset-eyelet.mp4" poster="img/video/onset-eyelet.webp" muted loop playsinline autoplay preload="metadata" '
        'aria-label="On set: the white eyelet dress moving in the breeze" width="446" height="920"></video></span>'
        '<span class="print__caption"><span class="print__code">on set</span><span class="print__desc hand">the eyelet dress, moving</span></span>'
        '</span></div></li>')
for i, stem in enumerate(order):
    l = by_stem[stem]
    w, h = l["size"]
    code = l["code"]
    desc = l["desc"][0].upper() + l["desc"][1:]
    tilt = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2][i % 6]
    sketch_rel = f"img/art/illus-{stem}.webp"
    sketch = (f'<img class="print__sketch" src="{sketch_rel}" alt="" loading="lazy" aria-hidden="true">'
              if exists(sketch_rel) else "")
    cls = "print has-sketch" if sketch else "print"
    items.append(
        f'<li class="{cls}" style="--tilt:{tilt}deg">'
        f'<button type="button" class="print__btn" data-look data-code="{code}" data-desc="{html.escape(desc)}" data-src="img/{l["img"]}" data-w="{w}" data-h="{h}">'
        f'{peg}'
        f'<span class="print__paper">'
        f'<span class="print__photo"><img src="img/{l["img"]}" alt="{html.escape(desc)}, style {code}" loading="lazy" width="{w}" height="{h}">{sketch}</span>'
        f'<span class="print__caption"><span class="print__code">{code}</span><span class="print__desc hand">{html.escape(desc.lower())}</span></span>'
        f'</span></button></li>'
    )

out = (tpl.replace("<!--LOGO_FILL-->", fill)
          .replace("<!--LOGO_STITCH-->", stitch)
          .replace("<!--LOOKS-->", "".join(items)))


def resolve(m):
    src, fb = m.group(1), m.group(2)
    return f'src="{src if exists(src) else fb}"'


out = re.sub(r'src="([^"]+)" data-fallback="([^"]+)"', resolve, out)
if exists("img/art/stamp-checked.webp"):
    out = out.replace('<span class="sheet__stamp" aria-hidden="true">Checked</span>',
                      '<img class="sheet__stamp sheet__stamp--art" src="img/art/stamp-checked.webp" alt="" aria-hidden="true">')
if not exists("img/art/illus-nit72118.webp"):
    out = re.sub(r"<!--MORPH-->.*?<!--/MORPH-->", "", out, flags=re.S)
(SITE / "index.html").write_text(out, encoding="utf-8")
print("built index.html", len(out) // 1024, "KB;", len(paths), "logo paths;", len(items), "prints;",
      sum('has-sketch' in i for i in items), "with sketches")
