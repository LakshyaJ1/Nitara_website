"""Build the nitara site: assemble every page from shared partials + page bodies.

    python site/tools/build.py

Inputs (site/src/):
    partials/head.html      <head> with {{TITLE}} {{DESCRIPTION}} {{PATH}} {{PRELOAD}} {{EXTRA_CSS}}
    partials/sprite.html    inline SVG symbols and patterns
    partials/nav.html       header + mobile menu, with {{HOME}} and {{CAP_CURRENT}}
    partials/footer.html    footer, with {{HOME}}
    pages/<name>.main.html  the inside of <main> for each page
    pages/<name>.after.html optional markup placed after the footer (dialogs, overlays)

Generated output (commit it): site/index.html, site/capabilities.html.
The build also inlines the traced nitara logo, renders the pegged collection line from
img/looks.json, and swaps in fallbacks for any art file that does not exist yet.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
SRC = SITE / "src"

# ----------------------------------------------------------------------------- pages
PAGES = [
    {
        "name": "index",
        "out": "index.html",
        "path": "/",
        "title": "Nitara India · Garment Manufacturing & Exports",
        "description": "Garment manufacturing and exports built around your business: design, digital print, hand and machine embroidery and production of women's and kids' wear, from Noida, India. Est. 2007.",
        "preload": "img/hero/poster-bench.webp",
        "css": [],
        "body_class": "page-home",
    },
    {
        "name": "capabilities",
        "out": "capabilities.html",
        "path": "/capabilities",
        "title": "Capabilities · Nitara India",
        "description": "Design studio, 16-head digital printing, hand and 24-head computerised embroidery, laser cutting, a 290-machine stitching floor, staged quality checks and SMETA-audited compliance, under one roof in Noida.",
        "preload": None,
        "css": ["css/capabilities.css"],
        "body_class": "page-capabilities",
    },
]

# collection order on the pegged line (strongest first)
LOOK_ORDER = ["nit72118", "nit72159", "nit72120", "nit72183", "nit72121", "nit72228", "nit72187-b",
              "nit72184", "nit72226", "nit72156", "nit72198", "nit72148", "nit72186-b", "nit72189-b",
              "nit72182", "nit72199", "nit7224", "nit72155", "nit72186", "nit72187", "nit72189",
              "nit72151", "nit72198-b", "nit72159-b"]
TILTS = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2]


def read(rel: str) -> str:
    return (SRC / rel).read_text(encoding="utf-8")


def exists(rel: str) -> bool:
    return (SITE / rel).exists()


# ----------------------------------------------------------------------------- logo
def logo_layers() -> tuple[str, str]:
    """Return (solid fill group, stitch layers) built from the traced logo paths."""
    svg = (SITE / "img/nitara-logo-traced.svg").read_text(encoding="utf-8")
    paths = re.findall(r'<path d="([^"]+)"[^>]*?transform="([^"]+)"', svg)
    if not paths:
        raise SystemExit("logo: no paths found in img/nitara-logo-traced.svg")
    solid = "".join(f'<path d="{d}" transform="{t}"/>' for d, t in paths)
    threads = "".join(f'<path class="s-thread" d="{d}" transform="{t}"/>' for d, t in paths)
    stitch = (
        '<defs><clipPath id="stitch-clip"><rect data-stitch-clip x="0" y="-20" width="1600" height="440"/></clipPath></defs>'
        f'<g class="s-satin" fill="url(#satin)">{solid}</g>'
        f'<g class="s-threads" clip-path="url(#stitch-clip)">{threads}</g>'
        '<circle class="s-needle" r="7" cx="0" cy="200" data-stitch-needle/>'
    )
    return f'<g fill="currentColor">{solid}</g>', stitch


# ----------------------------------------------------------------------------- collection
def collection_items() -> str:
    looks = {Path(l["img"]).stem: l for l in json.loads((SITE / "img/looks.json").read_text())}
    peg = ('<img class="print__peg" src="img/art/peg.webp" alt="" aria-hidden="true">'
           if exists("img/art/peg.webp") else '<span class="print__peg print__peg--css" aria-hidden="true"></span>')
    items = []
    if exists("img/video/onset-eyelet.mp4"):
        items.append(
            '<li class="print print--film" style="--tilt:-1.4deg"><div class="print__btn">' + peg +
            '<span class="print__paper"><span class="print__photo">'
            '<video src="img/video/onset-eyelet.mp4" poster="img/video/onset-eyelet.webp" muted loop playsinline autoplay preload="metadata" '
            'aria-label="On set: the white eyelet dress moving in the breeze" width="446" height="920"></video></span>'
            '<span class="print__caption"><span class="print__code">on set</span><span class="print__desc hand">the eyelet dress, moving</span></span>'
            '</span></div></li>')
    for i, stem in enumerate(LOOK_ORDER):
        look = looks.get(stem)
        if not look:
            print(f"  ! looks.json has no entry for {stem}; skipped")
            continue
        w, h = look["size"]
        code = look["code"]
        desc = look["desc"][0].upper() + look["desc"][1:]
        sketch_rel = f"img/art/illus-{stem}.webp"
        sketch = (f'<img class="print__sketch" src="{sketch_rel}" alt="" loading="lazy" aria-hidden="true">'
                  if exists(sketch_rel) else "")
        cls = "print has-sketch" if sketch else "print"
        items.append(
            f'<li class="{cls}" style="--tilt:{TILTS[i % len(TILTS)]}deg">'
            f'<button type="button" class="print__btn" data-look data-code="{code}" data-desc="{html.escape(desc)}" '
            f'data-src="img/{look["img"]}" data-w="{w}" data-h="{h}">{peg}'
            f'<span class="print__paper"><span class="print__photo">'
            f'<img src="img/{look["img"]}" alt="{html.escape(desc)}, style {code}" loading="lazy" width="{w}" height="{h}">{sketch}</span>'
            f'<span class="print__caption"><span class="print__code">{code}</span>'
            f'<span class="print__desc hand">{html.escape(desc.lower())}</span></span>'
            f'</span></button></li>')
    return "".join(items)


# ----------------------------------------------------------------------------- assemble
def build_page(page: dict, fill: str, stitch: str, looks_html: str) -> str:
    main_rel = f"pages/{page['name']}.main.html"
    if not (SRC / main_rel).exists():
        print(f"  ! {main_rel} missing; {page['out']} not built")
        return ""
    home = "" if page["name"] == "index" else "/"

    head = read("partials/head.html")
    head = (head.replace("{{TITLE}}", html.escape(page["title"]))
                .replace("{{DESCRIPTION}}", html.escape(page["description"]))
                .replace("{{PATH}}", page["path"])
                .replace("{{PRELOAD}}", f'<link rel="preload" as="image" href="{page["preload"]}">' if page["preload"] else "")
                .replace("{{EXTRA_CSS}}", "\n".join(f'<link rel="stylesheet" href="{c}">' for c in page["css"] if exists(c))))
    nav = (read("partials/nav.html").replace("{{HOME}}", home)
           .replace("{{CAP_CURRENT}}", ' aria-current="page"' if page["name"] == "capabilities" else ""))
    footer = read("partials/footer.html").replace("{{HOME}}", home)
    after_rel = f"pages/{page['name']}.after.html"
    after = read(after_rel) if (SRC / after_rel).exists() else ""

    doc = (
        head
        + f'<body class="{page["body_class"]}">\n'
        + '<a class="skip" href="#main">Skip to content</a>\n'
        + read("partials/sprite.html")
        + "\n" + nav
        + '\n<main id="main">\n' + read(main_rel) + "</main>\n\n"
        + footer + "\n" + after
        + '\n<script src="vendor/gsap.min.js"></script>\n'
          '<script src="vendor/ScrollTrigger.min.js"></script>\n'
          '<script src="vendor/lenis.min.js"></script>\n'
          '<script type="module" src="js/main.js"></script>\n'
          "</body>\n</html>\n"
    )
    doc = doc.replace("<!--LOGO_FILL-->", fill).replace("<!--LOGO_STITCH-->", stitch).replace("<!--LOOKS-->", looks_html)

    # art that has not been produced yet falls back to a real photo
    doc = re.sub(r'src="([^"]+)" data-fallback="([^"]+)"',
                 lambda m: f'src="{m.group(1) if exists(m.group(1)) else m.group(2)}"', doc)
    if exists("img/art/stamp-checked.webp"):
        doc = doc.replace('<span class="sheet__stamp" aria-hidden="true">Checked</span>',
                          '<img class="sheet__stamp sheet__stamp--art" src="img/art/stamp-checked.webp" alt="" aria-hidden="true">')
    if not exists("img/art/illus-nit72118.webp"):
        doc = re.sub(r"<!--MORPH-->.*?<!--/MORPH-->", "", doc, flags=re.S)

    left = re.findall(r"\{\{[A-Z_]+\}\}", doc)
    if left:
        raise SystemExit(f"{page['out']}: unreplaced placeholders {sorted(set(left))}")
    (SITE / page["out"]).write_text(doc, encoding="utf-8")
    return doc


def main() -> None:
    fill, stitch = logo_layers()
    looks_html = collection_items()
    for page in PAGES:
        doc = build_page(page, fill, stitch, looks_html)
        if doc:
            print(f"built {page['out']:<18} {len(doc) // 1024:>4} KB")
    prints = looks_html.count('<li class="print')
    print(f"collection: {prints} prints, {looks_html.count('has-sketch')} with sketches")


if __name__ == "__main__":
    main()
