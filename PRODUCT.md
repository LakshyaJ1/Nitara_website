# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML/CSS/JS with Three.js (WebGL) and GSAP + ScrollTrigger + Lenis. Chosen for fast load, no backend to maintain, and hosting anywhere (current site is a static export on Amazon S3; Netlify/Vercel also fine). Enquiry form needs a form endpoint or mailto/WhatsApp fallback (undecided).

## Users

Everyone who can bring value to the brand, in this order of commercial weight: international fashion brands and buyers looking for a design-and-manufacturing partner; sourcing agents and suppliers (fabric, trims) evaluating Nitara as a partner; end customers and fashion enthusiasts discovering the label; prospective employees and press. They arrive from a link in an email, a trade show, the PDF company profile's QR code, or search, usually on a laptop at work or a phone.

## Product Purpose

A brand-story website for Nitara India Pvt Ltd: present Nitara as a fashion house (design studio + atelier + factory) through its story, collections, craft, manufacturing capability and sustainability, so that visitors understand who Nitara is and get in touch. Showcase + enquiries only: no online shop or checkout. Success = qualified enquiries (form, email, WhatsApp, phone) from brands and buyers, and visitors leaving with a clear, premium impression of the brand.

## Positioning

A second-generation, design-led Indian fashion manufacturer: craft roots from the family's ancestral village (hand embroidery, Adda work, Chikan, hand-block print) joined to a modern, largely solar-powered factory (in-house 16-head digital printing, laser cutting, computerised embroidery, CAD). Tagline from the 2026 profile: "Elevating couture to artistry." Speciality: casual, hand-embroidered and bohemian-printed women's and kids' apparel.

## Operating Context

Visitors evaluate Nitara alongside its PDF company profile and line sheets; buyers want to see collections by style code, capability (machinery, processes), compliance (certifications) and a direct contact. The 2026 PDF carries a WhatsApp QR for "factory management, company profile, collection gallery".

## Capabilities and Constraints

- Pages/sections to cover: brand story and legacy, design studio, collections (women's + kids'), craft and processes, factory and machinery, quality, sustainability, clients and certifications, contact.
- Content source of truth: `research/pdf_notes.md` (2026 profile, supersedes the old site where they differ) and `CONTENT.md` (old site).
- No e-commerce, no prices.
- The old site's HTTPS is broken; the new deployment needs a valid certificate.
- Undecided: form backend, hosting target, domain/SSL setup, whether to expose all three named contacts publicly, whether the downloadable company profile PDF is linked from the site.

## Brand Commitments

- Name: **nitara** (lowercase hand-drawn script wordmark with wave underline; files in `assets/brand/logo/`). Company: Nitara India Pvt Ltd.
- Tagline: "Elevating couture to artistry.."; secondary line: "Delivering fashion that is just right, in style, on time."
- User brief: modern, artistic, creative, expressive fashion typography, immersive 3D, must not look AI-generated or templated; framed as the story of a fashion brand.
- Inspiration the user named: theinfinitysocks.com (its craft and interaction quality, not its sports look).

## Evidence on Hand

- Lookbook photography: `assets/campaign/` (18 high-res campaign photos, many 5000–10000 px), `assets/collections/vintage-ss2018/`, `assets/pdf_images/` (PDF pages with ~20 women's styles with codes nit72118–nit72228 and kids' styles nit kids 221–225; photos are composited onto patterned pages and will need cropping).
- Factory photos: `assets/factory/`, PDF pages 6–7.
- Certification logos: Better Cotton, Sedex in `assets/certifications/`; EcoVero, Livaeco, Lenzing Modal appear only in the PDF (need clean logo files).
- Client logos (from old site, © 2022): Versace, Moschino, GAS, DIDI, dk company, Roman Originals, FNG Group, Brands4Kids. **Confirm these may still be shown before publishing.**
- Facts: legacy began in the 1980s; current generation (NIFT alumni) 21 years; old site says established 2007; 95 kWp Tata rooftop solar ≈30% of electricity; 60 m³/day ETP; 1 L water per metre of digitally printed fabric; 290 Jack sewing machines; 24-head computerised embroidery; 2 laser cutters 1600×1900 mm.
- Contacts: Head Office E-63, Sector-63, Noida-201301, India; +91 120 4267008; tarun@nitaraindia.com; people: Sanyukta Mittal, Bharat Mahlawat, Tarun Mittal.
- Hero video: YouTube `cpSUFvEabUM` (not yet downloaded).
- Absent, must not be fabricated: testimonials, press mentions, awards, production volumes/capacity per month, lead times, MOQ, prices.

## Product Principles

1. Tell it as a story with a beginning (the family and the village), a middle (the studio, the craft, the factory) and an invitation (work with us).
2. Prove with real things: real garments, real machines, real numbers from the profile. No invented claims.
3. Serve the buyer without boring the dreamer: every chapter has a fast factual layer (codes, specs, certifications) under the expressive one.
4. Craft is the brand: hand embroidery, block print and thread should be felt in the interface itself, not just pictured.
5. Contact is always one step away.

## Accessibility & Inclusion

Content must stay readable with motion reduced (`prefers-reduced-motion`) and on mid-range phones over Indian mobile networks; WebGL is an enhancement over a complete HTML page, never a gate.
