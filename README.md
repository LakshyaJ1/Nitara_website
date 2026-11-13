# nitara — website

The brand site for **Nitara India Pvt Ltd**, live at [coutureacraft.com](https://coutureacraft.com) and [nitaraindia.com](https://nitaraindia.com).

Plain HTML, CSS and JavaScript (Three.js, GSAP, Lenis). No framework, and nothing to install to run it.

## How publishing works

The Vercel project `coutureacraft` is connected to this repository, and its **Root Directory is `site/`**.

- Every push to `main` deploys to production automatically, and both domains update together.
- Every other branch or pull request gets its own preview URL, so you can check a change before merging.

## Making a change

| What you want to change | Where |
|---|---|
| Text, sections, links | `site/src/index.template.html`, then rebuild (see below) |
| Colours, fonts, spacing, layout | `site/css/site.css` (later blocks override earlier ones) |
| Behaviour and animation | `site/js/main.js` (page), `site/js/tag3d.js` (3D hang tag), `site/js/fabric.js` (cloth swatches) |
| Collection looks on the rail | images in `site/img/look/`, list in `site/img/looks.json`, order in `site/tools/build.py` |
| Images | `site/img/…` (WebP, roughly 1000–2400 px wide) |

`site/index.html` is **generated**. After editing the template or the looks, rebuild it:

```bash
python site/tools/build.py
```

The build inlines the stitched nitara logo and the pegged lookbook. Python 3 is the only requirement. Commit `site/index.html` together with your change.

To preview locally:

```bash
cd site
python -m http.server 8080
# open http://localhost:8080
```

## Design system

`DESIGN.md` records the visual rules: dye-bath grounds, the four type roles, materials, components and motion. Read it before adding a new section, so the site stays consistent. `PRODUCT.md` holds the product facts, and `CONTENT.md` holds the source copy.

## Notes

- Large originals (the print artwork, poster, PDFs, raw video) are kept out of git; only web-sized versions live in `site/img/`.
- `site/img/provenance.json` records where every image came from, including AI-generated illustrations and their prompts.
- Email for both domains is unaffected by the website. Do not change MX records or nameservers when editing DNS.
