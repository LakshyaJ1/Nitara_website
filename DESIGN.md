---
name: nitara
description: The Sampling Room. A garment house's story told as hang tags on dyed cloth.
colors:
  charcoal-print: "#221F1D"
  madder: "#A42E28"
  madder-deep: "#7E211C"
  turmeric: "#DFA12C"
  manila: "#D6AC67"
  chalk: "#F3EDE3"
  print-paper: "#FBF7EF"
  indigo-ink: "#1A2238"
  indigo: "#1B2440"
  indigo-deep: "#121830"
  brass: "#B8913F"
  muted-on-charcoal: "#C9C3BA"
  muted-on-manila: "#4A3F2F"
typography:
  display:
    fontFamily: "Rozha One, Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.6rem, 6.2vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Rozha One, Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2rem, 3.6vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Rozha One, Bodoni Moda, Georgia, serif"
    fontSize: "clamp(1.35rem, 2vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.05
  lede:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.12rem, 1.4vw + .5rem, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Hanken Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(16px, 1.05vw + 10px, 19px)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Courier Prime, Courier New, monospace"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.12em"
  hand:
    fontFamily: "Kalam, Segoe Print, cursive"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
rounded:
  edge: "3px"
  stamp: "4px"
  label-tail: "16px"
  pill: "30px"
spacing:
  gutter: "clamp(20px, 4vw, 64px)"
  tag-column: "clamp(220px, 22vw, 340px)"
  chapter-top: "clamp(96px, 14vh, 170px)"
  chapter-bottom: "clamp(90px, 12vh, 150px)"
components:
  button-stamp:
    backgroundColor: "{colors.madder}"
    textColor: "{colors.chalk}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "1.05em 1.6em"
  button-stamp-hover:
    backgroundColor: "{colors.madder-deep}"
  button-stamp-on-madder:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.chalk}"
  nav-buyers-tag:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.indigo-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.label-tail}"
    padding: "10px 16px 10px 12px"
  chapter-tag:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.indigo-ink}"
    width: "230px"
  counter-tag:
    backgroundColor: "{colors.manila}"
    textColor: "{colors.indigo-ink}"
    rounded: "{rounded.label-tail}"
    padding: "10px 16px 10px 34px"
  spec-sheet:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.indigo-ink}"
    typography: "{typography.label}"
  field-input:
    backgroundColor: "rgba(243, 237, 227, .45)"
    textColor: "{colors.indigo-ink}"
    rounded: "{rounded.edge}"
    padding: "10px 10px 8px"
  chip-selected:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
---

# Design System: nitara

## Overview

**Creative North Star: "The Sampling Room"**

nitara is told as a sampling room: every chapter is a hang tag strung on one cotton string, story on the front and buyer facts on the back, and every ground is a cloth rather than a paint. The page is a long, single scroll of dye-bath chapters (charcoal print, madder, manila, turmeric) with a sticky manila tag hanging in a left column and the story beside it. Everything that holds information is a made object from the trade: tags with brass eyelets, a chalk spec sheet with a rubber stamp, a woven care label, photographic prints pegged to a line, a sketchbook page pinned with brass. The interface is tactile and slightly off-square; nothing sits at exactly zero degrees unless it is being touched.

The dark ground is the client's own charcoal antique floral print (madder and indigo flowers on near-black), darkened under an 80 to 90 percent charcoal veil so it reads as texture, never pattern. It carries the cover cloth, the dark chapters and the footer, and its printed border band is the seam that closes the cover. The light grounds carry a grayscale linen weave at 32 percent overlay so they read as dyed cotton.

Density is editorial and generous: one idea per chapter, a fast factual layer under the expressive one (codes, machine counts, certifications), and the designer's own handwriting in the margins.

**Key Characteristics:**
- Chapter grounds are dye baths; the dark ground is the client's charcoal floral print.
- Information lives on objects from the garment trade: tags, stamps, spec sheets, care labels, pegged prints.
- Four voices of type: Rozha One display, Hanken Grotesk text, Courier Prime codes, Kalam handwriting.
- Running stitches (dashed rules) replace solid dividers everywhere.
- Small rotations (roughly -2 to +2 degrees) on every handled object; straightening is the hover state.

## Colors

A full-colour dye-bath palette: each chapter commits to one saturated ground, with madder as the voice of action and turmeric as thread.

### Primary
- **Madder Red** (madder): the stamp colour. Primary buttons, style codes, fact labels on tag backs, the "Checked" sheet stamp, chapter Devanagari words, and the entire craft chapter ground. On a madder ground the stamp turns indigo.
- **Deep Madder** (madder-deep): stamp hover, ledger figures, care-label headings, error text.

### Secondary
- **Turmeric Thread** (turmeric): the thread on dark grounds. The stitched wordmark, running-stitch rules under headings, timeline dates, focus outlines, selection, and the rail and clients chapter grounds.

### Tertiary
- **Undyed Manila** (manila): tag paper. Every chapter tag, the "For buyers" nav tag, the counter tag, the enquiry tag, the studio and conscience grounds, and the footer wordmark. Rendered with a manila paper texture over the flat value.
- **Brass** (brass): eyelet rings, pins, pegs and the WebGL tag's eyelet. Hardware only.

### Neutral
- **Charcoal Print** (charcoal-print): body and dark-chapter ground, always under the floral print texture and a charcoal veil.
- **Chalk** (chalk): text on dark and madder grounds; spec sheet, pinned paper and chapter-tag faces on manila and turmeric grounds.
- **Print Paper** (print-paper): the warmer white of photographic prints, the sketch-to-sample stage and sketch backgrounds.
- **Indigo Ink** (indigo-ink): text on manila, turmeric, chalk and paper.
- **Indigo** (indigo) and **Deep Indigo** (indigo-deep): accents from the print's own flowers. Selected chips, timeline beads, eyelet holes, the stamp on madder; deep indigo carries the mobile menu, the look lightbox and the scrollbar track.
- **Muted text** varies by ground: muted-on-charcoal on dark, muted-on-manila on manila, #F1D9D2 on madder, #3D3220 on turmeric.

### Named Rules
**The Dye Bath Rule.** A chapter takes one ground from the four baths (charcoal print, madder, manila, turmeric) and re-points its thread colour to match: turmeric on charcoal, chalk on madder, madder on manila, indigo on turmeric. Never a gradient between grounds, never a white page.

**The Thread Follows the Ground Rule.** Rules, stitch underlines, timeline lines and link underlines use the ground's thread variable, not a fixed colour.

## Typography

**Display Font:** Rozha One (with Bodoni Moda, Georgia)
**Body Font:** Hanken Grotesk (with Helvetica Neue, Arial)
**Label/Mono Font:** Courier Prime (with Courier New)
**Hand Font:** Kalam (with Segoe Print, cursive), Indian Type Foundry, Latin and Devanagari

**Character:** A high-contrast Indian display serif carries the chapter voice; a plain grotesk does the reading; a typewriter face is the stamped and typed layer of the trade (codes, sheets, labels); and Kalam is the designer's pencil, writing notes in the margins and the Devanagari chapter words.

### Hierarchy
- **Display** (400, clamp(2.6rem, 6.2vw, 6rem), 0.98, max 14ch, balanced): chapter headings, always with a running stitch drawn under them. Medium (clamp(2.2rem, 4.6vw, 4.4rem)) and small (clamp(1.7rem, 2.8vw, 2.7rem), max 22ch) steps exist.
- **Headline** (400, clamp(2rem, 3.6vw, 3.6rem), 1): the cover tagline, with the second clause in turmeric.
- **Title** (400, 1.35rem to 2.5rem, about 1.05): tag titles, timeline headings, swatch names, pull quotes, ledger figures, the counter tag name.
- **Lede** (400, clamp(1.12rem, 1.4vw + .5rem, 1.5rem), 1.45, max 36ch): the opening paragraph of a chapter.
- **Body** (400, 16 to 19px fluid, 1.6, max 66ch): reading text; secondary paragraphs take the ground's muted colour.
- **Label** (Courier Prime 700 or 400, .75 to .95rem, .1 to .16em tracking, uppercase): buttons, style codes, fact terms, form labels, spec sheet. Style codes such as nit72118 stay lowercase.
- **Hand** (Kalam 400, 1.1 to 2rem, 1.1): margin notes, captions on sketches and badges, timeline dates, print descriptions, and the Devanagari chapter words on tags (700, madder).

### Named Rules
**The Four Hands Rule.** Each face has one job: Rozha speaks, Hanken explains, Courier records, Kalam annotates. Kalam is never used for headings or body copy, and Courier never for prose.

## Layout

Desktop chapters are a two-column grid: a sticky tag column (clamp(220px, 22vw, 340px)) and a body column (max 1180px), separated by the gutter (clamp(20px, 4vw, 64px)). A 1.5px string runs down the centre of the tag column through every chapter at 32 percent of the ink colour, so tags read as hanging on one line. Chapters breathe vertically (clamp(96px, 14vh, 170px) top, clamp(90px, 12vh, 150px) bottom). Horizontal tracks (the floor reel and the rail) bleed off the right edge, scrolled by pinned scroll on desktop and native snap scrolling on mobile.

The cover is a split: the charcoal print cloth (min(52vw, 900px)) with a pinked right edge holds the stitched wordmark, the tagline, lede and actions; the poster photograph fills the right from 44 percent; the WebGL tag hangs over the photograph.

At 1100px the nav links collapse into a menu of tilted manila tags. At 820px the tag column collapses to zero, the string disappears, tags follow the copy instead of heading it, the cover stacks photo-over-cloth with a pinked top edge, and all two-column grids go single.

## Elevation & Depth

Depth is physical, not interface: objects lie on cloth and cast the soft, long, offset-down shadow of paper on a table. Shadows always use a negative spread so they sit under the object rather than haloing it. Rotation and texture do more depth work than shadow.

### Shadow Vocabulary
- **Tag lift** (`box-shadow: 0 6px 16px -8px rgba(0,0,0,.5)`): small manila tags, the stamp button.
- **Paper on table** (`box-shadow: 0 22px 40px -22px rgba(0,0,0,.4), 0 2px 4px rgba(0,0,0,.12)`): pinned paper, prints, care label, morph stage.
- **Sheet drop** (`box-shadow: 0 30px 50px -30px rgba(0,0,0,.7)`): spec sheet and enquiry tag on dark grounds.

### Named Rules
**The Lying-Flat Rule.** Every shadow falls downward with a negative spread, as from overhead studio light. No glows, no hard offset shadows, no coloured shadows.

## Shapes

Shapes are cut, not rounded. The hang tag silhouette (a clipped polygon with chamfered top corners and a brass eyelet near the top) is the system's signature and recurs on chapter tags, look tags, the enquiry form and the lightbox tag. Smaller labels use an asymmetric "label tail" (3px square end, 14 to 18px rounded end) with an eyelet on the square end. Cloth edges are pinked (zig-zag SVG masks) on swatches and the cover cloth. Dividers are dashed running stitches; solid rules appear only as the tag string and the spec sheet head. Corners elsewhere stay near-square (3 to 6px); the only full pills are chips and the motion toggle.

## Components

### Buttons
- **Stamp (primary):** a rubber stamp. Courier Prime 700 uppercase, .14em tracking, chalk on madder, 4px corners, a chalk border plus an inset outline at -7px to read as a stamp frame, masked with an ink-grain texture for uneven pressure, rotated -1.5deg.
- **Hover / Active:** straightens to 0deg and scales to 1.03 with deep madder; active presses to .97. Focus is a 2px dashed turmeric outline (madder on light grounds).
- **Thread link (secondary):** Hanken 500 with a dashed thread underline in the ground's thread colour and an arrow; the gap opens on hover.

### Chips
- **Style:** Hanken .88rem in a 1.5px dashed indigo-ink pill on the manila enquiry tag.
- **State:** selected becomes solid indigo with chalk text and a solid border.

### Cards / Containers
There are no generic cards. Containers are trade objects: the chapter tag (manila face, inner dashed border, 3D flip to a facts back), the spec sheet (chalk, Courier, dashed row rules, tabular numbers, an ink stamp that lands with a scale-down), the woven care label (fold strip, line icons, Rozha headings in deep madder), the pinned sketchbook paper, and prints on paper.

### Inputs / Fields
- **Style:** translucent chalk wash on the manila enquiry tag, no box, a 2px dashed indigo-ink bottom stitch, 3px top corners, Courier uppercase labels.
- **Focus:** fill turns solid chalk and the stitch turns madder.
- **Error:** madder stitch with a #F2D9C8 wash and a deep madder message.

### Navigation
Fixed, transparent, hides on scroll down. Wordmark at 116px, Hanken 500 links with a dashed underline that draws in from the left on hover and for the current chapter. Ink flips between chalk and indigo-ink with the ground. A manila "For buyers" tag rotated 2deg sits right. A fixed manila counter tag bottom-right carries the chapter number and name and ticks on change. Below 1100px a full-screen deep indigo menu lists chapters as alternately tilted manila tags.

### Hang Tag (signature)
The WebGL manila tag on the cover swings on its string, can be dragged and turned over, and carries "Elevating couture to artistry."; a CSS swaying tag replaces it without WebGL. Chapter tags settle with a damped swing on arrival and flip on demand.

### Prints on a Line (signature)
The rail is photographic prints with a white paper border, pegged to a drawn cotton line, each at its own tilt. A designer sketch sits over each photo and crossfades to the garment on hover or focus (photo shown by default on touch); one print is a looping video. Kalam captions with a madder Courier style code.

### Sketch-to-Sample Wipe
A paper stage where a scroll-scrubbed wipe, led by a dashed madder needle line, replaces the sketch with the sample photograph, flanked by two Kalam notes.

### Motion grammar
One easing for everything handled (cubic-bezier(.16, 1, .3, 1)). Things are sewn or settle: the wordmark is stitched by a travelling needle then filled, headings get their running stitch drawn, tags swing to rest, the sheet stamp presses down, prints rise in with alternating tilt. Scroll-linked motion is scrubbed, never autoplayed. Reduced motion and the footer motion toggle stop Lenis, pause GSAP and collapse all transitions; the page is complete without motion or WebGL.

## Do's and Don'ts

### Do:
- **Do** put every chapter on one dye-bath ground and point its thread colour at the matching ink.
- **Do** carry facts on trade objects: tags, stamps, spec sheets, care labels, codes in Courier Prime.
- **Do** tilt handled objects between about -2 and +2 degrees and straighten them on hover.
- **Do** draw dividers as dashed running stitches in the ground's thread colour.
- **Do** keep the charcoal print under a charcoal veil of at least 80 percent so text on it holds contrast.
- **Do** use Kalam only for the designer's annotations and the Devanagari chapter words.

### Don't:
- **Don't** use a white page, a single centred campaign photo, or a serif-on-white luxury-label layout.
- **Don't** draw solid hairline dividers or generic rounded cards; use stitches and trade objects.
- **Don't** use glows, coloured shadows or hard offset shadows; shadows fall soft and downward.
- **Don't** add small uppercase kickers above headings; the chapter word lives on the tag.
- **Don't** autoplay motion that cannot be paused; scroll-linked effects scrub, and reduced motion stills everything.
