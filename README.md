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
| Home page text and sections | `site/src/pages/index.main.html` |
| Home page order | Story (with the signed note on our two names, `#our-name`) → Design Studio (Print Studies column, `#print-studies`) → Craft → Factory (garment floor reel, then the print line 01–04) → Environment & Responsibilities → Collection rail → High Fashion (`#couture`) → Kids (`#kids`) → Clients → Contact |
| Capabilities page | `site/src/pages/capabilities.main.html` + `site/css/capabilities.css` |
| Print Studio, High Fashion, Kids pages (`/prints`, `/high-fashion`, `/kids`) | `site/src/pages/prints.main.html`, `high-fashion.main.html`, `kids.main.html` + `site/css/studio.css`. Images in `site/img/prints/`, `site/img/high-fashion/`, `site/img/kids/`. The "View all print studies" / "View the full edit" buttons open the shared Google Drive folders. |
| Header / menu, footer, `<head>` (titles, SEO) | `site/src/partials/` (`nav.html`, `footer.html`, `head.html`) and the page list at the top of `site/tools/build.py` |
| Colours, fonts, spacing, layout | `site/css/site.css` (later blocks override earlier ones) |
| Behaviour and animation | `site/js/main.js` (one documented module, sections 0–16) and `site/js/fabric.js` (cloth swatches) |
| Collection prints on the line | images in `site/img/look/`, sketches in `site/img/art/illus-<code>.webp`, list in `site/img/looks.json`, order in `site/tools/build.py` |
| Enquiry forms | one form per page (home contact, `/prints#request`, `/high-fashion#enquire`, `/kids#enquire`), all sent by `main.js` section 15. Each field's `data-label` is its row in the email; `data-subject` on the form sets the subject. Delivered by FormSubmit to sanyukta@nitaraindia.com with tarun@nitaraindia.com copied (`ENQUIRY_TO`, `ENQUIRY_CC`). Attachments (up to 5 files, 5 MB) are resized in the browser and sent as multipart. `data-pick` links pre-select a style in the form. |
| Company profile download | `site/downloads/Nitara-India-Company-Profile-2026.pdf` (a web-compressed copy of the 2026 profile). Replace the file, keeping the name, to update it. |
| WhatsApp number | `wa.me/918860615556` links in `index.main.html` (contact), `capabilities.main.html` (closing section) and `partials/footer.html` (footer link + floating button), plus the enquiry sections of `high-fashion.main.html` and `kids.main.html`. |

`site/index.html` and `site/capabilities.html` are **generated**. After editing anything in `site/src/` or the looks, rebuild:

```bash
python site/tools/build.py
```

Python 3 is the only requirement. Commit the generated pages together with your change.

To preview locally:

```bash
python site/tools/serve.py
# open http://localhost:8080 and http://localhost:8080/capabilities
```

`serve.py` behaves like Vercel (clean URLs such as `/capabilities`) and never caches, so a rebuild shows up on refresh.

## Review comments (Agentation)

On a local preview, a round toolbar button sits at the bottom right (desktop only). Click it, click any element and write what should change. Comments go to the Agentation server that Claude Code runs (MCP `agentation`, port 4747), and Claude can read, fix and resolve them.

- To let someone else comment, forward port 8080 (VS Code "Ports" panel, ngrok, etc.) and send them that link. `serve.py` passes their comments through the same port, so nothing else needs to be opened.
- Only share the link with people you trust: anyone who can open it can leave comments that will be acted on.
- The toolbar never loads on nitaraindia.com, coutureacraft.com or Vercel previews, and `site/dev/` is not deployed.
- The toolbar bundle is `site/dev/agentation.js`, built from `site/tools/agentation-entry.jsx` with esbuild (React 18 + `agentation`).

## Design system

`DESIGN.md` records the visual rules: dye-bath grounds, the four type roles, materials, components and motion. Read it before adding a new section, so the site stays consistent. `PRODUCT.md` holds the product facts, and `CONTENT.md` holds the source copy.

## Notes

- Large originals (the print artwork, poster, PDFs, raw video) are kept out of git; only web-sized versions live in `site/img/`.
- `site/img/provenance.json` records where every image came from, including AI-generated illustrations and their prompts.
- Email for both domains is unaffected by the website. Do not change MX records or nameservers when editing DNS.
