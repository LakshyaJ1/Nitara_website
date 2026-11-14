/**
 * nitara — site behaviour (all pages)
 * ---------------------------------------------------------------------------
 * The HTML is complete and readable without this file. Everything here is an
 * enhancement, and every feature checks that its elements exist first, so the
 * same module runs on the home page and on /capabilities.
 *
 * Motion policy
 *   - Visitors who prefer reduced motion, or who press "Pause motion", get a
 *     still page: no smooth scrolling, no pinned reels, no ambient animation.
 *   - Scroll-linked effects are scrubbed (they follow the scrollbar); nothing
 *     autoplays except the one-time hero entrance.
 *
 * Libraries (loaded as classic scripts before this module):
 *   window.gsap, window.ScrollTrigger (GSAP 3.12), window.Lenis (1.1)
 */

/* =========================================================================
   0. Utilities and shared state
   ========================================================================= */

const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isDesktop = () => window.innerWidth > 820;
const isHomePage = () => /^\/(index(\.html)?)?$/.test(location.pathname);

const { gsap, ScrollTrigger } = window;
const hasGsap = Boolean(gsap && ScrollTrigger);
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/** Single source of truth for the motion preference. */
const motion = {
  still: reducedMotion.matches || root.classList.contains('still'),
  listeners: new Set(),
  set(value) {
    this.still = value;
    root.classList.toggle('still', value);
    try { localStorage.setItem('nitara-motion', value ? 'off' : 'on'); } catch (e) { /* private mode */ }
    this.listeners.forEach((fn) => fn(value));
  },
  onChange(fn) { this.listeners.add(fn); },
};

/** Run a feature in isolation: one broken feature must never stop the rest. */
function feature(name, init) {
  try { init(); } catch (error) { console.error(`[nitara] ${name} failed`, error); }
}

/* =========================================================================
   1. Smooth scrolling (Lenis), synced with ScrollTrigger
   ========================================================================= */

let lenis = null;

function startSmoothScroll() {
  if (lenis || motion.still || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
  if (hasGsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
  } else {
    const loop = (time) => { if (lenis) { lenis.raf(time); requestAnimationFrame(loop); } };
    requestAnimationFrame(loop);
  }
}
function lenisTick(time) { if (lenis) lenis.raf(time * 1000); }
function stopSmoothScroll() {
  if (!lenis) return;
  if (hasGsap) gsap.ticker.remove(lenisTick);
  lenis.destroy();
  lenis = null;
}

/** Scroll to an element (or the top) the same way everywhere. */
function scrollToTarget(target) {
  if (!target) return;
  const toTop = target === document.body || target.id === 'top';
  if (lenis) lenis.scrollTo(toTop ? 0 : target, { duration: 1.3 });
  else if (toTop) window.scrollTo({ top: 0, behavior: motion.still ? 'auto' : 'smooth' });
  else target.scrollIntoView({ behavior: motion.still ? 'auto' : 'smooth', block: 'start' });
}

/* =========================================================================
   2. In-page links: "#id" everywhere, and "/#id" when we are on the home page
   ========================================================================= */

function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const href = link.getAttribute('href');
    let hash = null;
    if (href.startsWith('#')) hash = href;
    else if (href.startsWith('/#') && isHomePage()) hash = href.slice(1);
    if (!hash || hash === '#') return;

    const target = hash === '#top' ? document.body : document.getElementById(hash.slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    scrollToTarget(target);
    history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
    if (hash !== '#top') {
      // move keyboard focus with the view, without a second jump
      window.setTimeout(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, motion.still ? 0 : 900);
    }
  });

  // arriving from another page with a hash (e.g. /capabilities -> /#contact)
  if (location.hash && location.hash.length > 1) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) window.addEventListener('load', () => window.setTimeout(() => scrollToTarget(target), 120), { once: true });
  }
}

/* =========================================================================
   3. Header: hides on the way down, returns on the way up; its ink follows
      the ground under it; the current chapter's link is marked
   ========================================================================= */

function initHeader() {
  const nav = $('[data-nav]');
  if (!nav) return;
  const chapters = $$('[data-chapter], main > section');
  const links = $$('.nav__links a[href*="#"]');
  const lightGrounds = ['ground-manila', 'ground-turmeric'];
  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.9 && !root.classList.contains('menu-open'));
    lastY = y;

    // ink: what ground sits under the header line?
    const probe = 36;
    const under = chapters.find((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    document.body.dataset.ink = under && lightGrounds.some((c) => under.classList.contains(c)) ? 'dark' : 'light';

    // current link: the chapter crossing the middle of the viewport
    const middle = window.innerHeight * 0.45;
    const current = chapters.filter((el) => el.getBoundingClientRect().top <= middle).pop();
    links.forEach((a) => {
      const id = a.getAttribute('href').split('#')[1];
      a.setAttribute('aria-current', current && current.id === id ? 'true' : 'false');
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* =========================================================================
   4. Mobile menu: modal, focus-trapped, closes on Escape or link
   ========================================================================= */

const menu = $('[data-menu]');
const menuOpenButton = $('[data-menu-open]');

function openMenu() {
  if (!menu) return;
  menu.hidden = false;
  root.classList.add('menu-open');
  menuOpenButton?.setAttribute('aria-expanded', 'true');
  lenis?.stop();
  ($('a', menu) || $('[data-menu-close]', menu))?.focus();
}
function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  root.classList.remove('menu-open');
  menuOpenButton?.setAttribute('aria-expanded', 'false');
  lenis?.start();
}
function initMenu() {
  if (!menu) return;
  menuOpenButton?.addEventListener('click', openMenu);
  $('[data-menu-close]', menu)?.addEventListener('click', () => { closeMenu(); menuOpenButton?.focus(); });
  document.addEventListener('keydown', (event) => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { closeMenu(); menuOpenButton?.focus(); return; }
    if (event.key !== 'Tab') return;
    const focusable = $$('a, button', menu);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

/* =========================================================================
   5. Hero entrance: the wordmark is sewn in, then the headline lines rise,
      the three promises arrive one by one, joined by a drawn stitch
   ========================================================================= */

function initHero() {
  const hero = $('.hero');
  if (!hero) return;
  const logo = $('[data-stitch-logo]', hero);
  const ready = () => hero.classList.add('is-ready');

  if (!logo) { requestAnimationFrame(ready); return; }
  const clip = $('[data-stitch-clip]', logo);
  const needle = $('[data-stitch-needle]', logo);
  const satin = $('.s-satin', logo);

  if (motion.still || !hasGsap) {
    clip.setAttribute('width', 1600);
    satin.style.opacity = 1;
    logo.classList.add('is-sewn');
    ready();
    return;
  }

  clip.setAttribute('width', 0);
  const progress = { x: 0 };
  gsap.timeline({ delay: 0.15 })
    .add(ready, 0.1)
    .set(needle, { opacity: 1 }, 0)
    .to(progress, {
      x: 1600, duration: 1.9, ease: 'power1.inOut',
      onUpdate() {
        clip.setAttribute('width', progress.x);
        needle.setAttribute('cx', progress.x);
        needle.setAttribute('cy', 190 + Math.sin(progress.x / 34) * 70);
      },
    }, 0)
    .to(needle, { opacity: 0, duration: 0.25 }, '-=0.2')
    .to(satin, { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.5')
    .add(() => logo.classList.add('is-sewn'), '-=0.2');

  // the photograph drifts a little slower than the page
  gsap.to('.hero__photo img', {
    yPercent: 10, scale: 1.05, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* =========================================================================
   6. Arrivals: stitched headings, chapter tags, [data-reveal] and
      [data-reveal-stagger] blocks — each animates once, when it enters
   ========================================================================= */

function initReveals() {
  $$('[data-reveal-stagger]').forEach((list) => {
    [...list.children].forEach((child, index) => child.style.setProperty('--i', index));
  });
  const blocks = $$('.reveal-stitch, .chapter__tag, [data-reveal]');
  const lists = $$('[data-reveal-stagger]');
  if (!('IntersectionObserver' in window)) { [...blocks, ...lists].forEach((el) => el.classList.add('is-in')); return; }
  const revealOnce = (observer) => (entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    observer.unobserve(entry.target);
  });
  // single blocks reveal once a quarter of them is visible
  const blockObserver = new IntersectionObserver((e) => revealOnce(blockObserver)(e), { threshold: 0.25, rootMargin: '0px 0px -6% 0px' });
  // lists can be taller than the viewport, so they start as soon as their top edge is well inside it
  const listObserver = new IntersectionObserver((e) => revealOnce(listObserver)(e), { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  blocks.forEach((el) => blockObserver.observe(el));
  lists.forEach((el) => listObserver.observe(el));

  // Safety net: a fast jump (anchor link, smooth-scroll fling, End key) can carry an element
  // past the viewport without it ever intersecting. Anything whose top is already in or above
  // the view is revealed, so nothing can stay hidden behind the reader.
  const pending = new Set([...blocks, ...lists]);
  const sweep = () => {
    const limit = window.innerHeight * 0.92;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('is-in');
        pending.delete(el);
      }
    });
  };
  let sweepQueued = false;
  window.addEventListener('scroll', () => {
    if (sweepQueued || !pending.size) return;
    sweepQueued = true;
    requestAnimationFrame(() => { sweepQueued = false; sweep(); });
  }, { passive: true });
  sweep();
}

/* =========================================================================
   7. Figures that count up once: <span data-count="290">290</span>
   ========================================================================= */

function initCounters() {
  const figures = $$('[data-count]');
  if (!figures.length || motion.still || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const end = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const duration = clamp(600 + end * 4, 700, 1800);
      const start = performance.now();
      const step = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (end * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = (0).toFixed(decimals);
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  figures.forEach((el) => observer.observe(el));
}

/* =========================================================================
   8. Chapter tags: turn on their string to show the facts on the back
   ========================================================================= */

function initChapterTags() {
  $$('[data-flip]').forEach((wrap) => {
    const tag = $('.tag', wrap);
    const button = $('.tag__turn', wrap);
    if (!tag) return;
    let animation = null;
    const rotate = (y, z, lift) => `rotateY(${y}deg) rotateZ(${z}deg) translateY(${lift}px)`;

    // once the arrival swing has played, the turn owns the transform
    tag.addEventListener('animationend', () => wrap.classList.add('is-settled'));

    function turn() {
      wrap.classList.add('is-settled');
      const from = wrap.classList.contains('is-flipped') ? 180 : 0;
      const to = from === 0 ? 180 : 0;
      const dir = to > from ? 1 : -1;
      wrap.classList.toggle('is-flipped', to === 180);
      button?.setAttribute('aria-pressed', String(to === 180));
      animation?.cancel();

      if (motion.still) {
        animation = tag.animate([{ transform: rotate(from, 0, 0) }, { transform: rotate(to, 0, 0) }],
          { duration: 240, easing: 'ease-out', fill: 'forwards' });
        return;
      }
      animation = tag.animate([
        { transform: rotate(from, 0, 0), offset: 0 },
        { transform: rotate(from + dir * 40, -3 * dir, -12), offset: 0.22, easing: 'ease-in' },
        { transform: rotate(from + dir * 90, -5 * dir, -16), offset: 0.45 },
        { transform: rotate(to + dir * 14, 2.5 * dir, -4), offset: 0.72 },
        { transform: rotate(to - dir * 5, -1 * dir, 0), offset: 0.88 },
        { transform: rotate(to, 0, 0), offset: 1 },
      ], { duration: 1150, easing: 'cubic-bezier(.33,0,.2,1)', fill: 'forwards' });
    }

    if (button) {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', (event) => { event.stopPropagation(); turn(); });
    }
    tag.addEventListener('click', turn);
  });
}

/* =========================================================================
   9. Chapter counter (home): the small tag bottom-right names where you are
   ========================================================================= */

function initChapterCounter() {
  const counter = $('[data-counter]');
  const chapters = $$('[data-chapter]');
  if (!counter || !chapters.length) return;
  const number = $('[data-counter-no]', counter);
  const name = $('[data-counter-name]', counter);
  const total = String(chapters.length - 1).padStart(2, '0');
  let current = -1;

  function update() {
    const middle = window.innerHeight * 0.45;
    let index = 0;
    chapters.forEach((el, i) => { if (el.getBoundingClientRect().top <= middle) index = i; });
    if (index === current) return;
    current = index;
    number.textContent = `${String(index).padStart(2, '0')} / ${total}`;
    name.textContent = chapters[index].dataset.chapter;
    counter.classList.add('is-ticking');
    window.setTimeout(() => counter.classList.remove('is-ticking'), 380);
  }
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  update();
}

/* =========================================================================
   10. Horizontal reels (factory photos, collection line): pinned and
       scrubbed sideways on desktop, native swipe on touch and when still
   ========================================================================= */

const pinnedReels = [];
function setupReels() {
  pinnedReels.splice(0).forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill(); });
  if (!hasGsap || motion.still || !isDesktop()) {
    $$('.reel__track, [data-rack-list]').forEach((track) => { track.style.transform = ''; });
    return;
  }
  [['[data-reel]', '.reel__track'], ['[data-rack]', '[data-rack-list]']].forEach(([wrapSelector, trackSelector]) => {
    const wrap = $(wrapSelector);
    const track = wrap && $(trackSelector, wrap);
    if (!track) return;
    const distance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
    pinnedReels.push(gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'center center', end: () => `+=${distance()}`,
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      },
    }));
  });
  ScrollTrigger.refresh();
}

/* =========================================================================
   11. Collection line: a cotton line sagging between pegs; prints sway
       with scroll speed like paper on a draught
   ========================================================================= */

function initCollectionLine() {
  const list = $('[data-rack-list]');
  const line = $('[data-rack-line]');
  if (!list || !line) return;

  function drawLine() {
    if (line.parentElement !== list) { list.style.position = 'relative'; list.prepend(line); }
    const prints = $$('.print', list);
    const width = list.scrollWidth;
    line.setAttribute('width', width);
    line.setAttribute('viewBox', `0 0 ${width} 120`);
    const pegY = 18;
    let x0 = 0;
    let d = `M 0 ${pegY - 6}`;
    prints.forEach((print) => {
      const x = print.offsetLeft + print.offsetWidth / 2;
      const sag = clamp((x - x0) * 0.07, 14, 46);
      d += ` Q ${(x0 + x) / 2} ${pegY + sag} ${x} ${pegY}`;
      x0 = x;
    });
    d += ` Q ${(x0 + width) / 2} ${pegY + 30} ${width} ${pegY - 6}`;
    $('path', line).setAttribute('d', d);
  }
  window.addEventListener('load', drawLine);
  window.addEventListener('resize', () => requestAnimationFrame(drawLine));
  drawLine();

  if (!hasGsap) return;
  const buttons = $$('.print__btn', list);
  const tilts = buttons.map((b) => parseFloat(getComputedStyle(b.closest('li')).getPropertyValue('--tilt')) || 0);
  let swing = 0;
  let velocity = 0;
  let lastY = window.scrollY;
  gsap.ticker.add(() => {
    if (motion.still) return;
    const y = window.scrollY;
    const speed = y - lastY;
    lastY = y;
    velocity = (velocity - speed * 0.05 - swing * 0.08) * 0.86;   // spring back to rest, damped
    swing = clamp(swing + velocity, -7, 7);
    if (Math.abs(swing) < 0.01 && Math.abs(velocity) < 0.01) return;
    buttons.forEach((button, i) => { button.style.transform = `rotate(${tilts[i] + swing * (0.7 + (i % 3) * 0.2)}deg)`; });
  });
}

/* =========================================================================
   12. Studio: the sketch wipes away to reveal the sample, scrubbed by scroll
   ========================================================================= */

function initMorph() {
  const morph = $('[data-morph]');
  if (!morph) return;
  const set = (p) => {
    morph.style.setProperty('--wipe', `${(p * 100).toFixed(2)}%`);
    morph.style.setProperty('--wipe-n', p.toFixed(4));
  };
  if (!hasGsap || motion.still) { set(0.5); return; }
  ScrollTrigger.create({ trigger: morph, start: 'top 75%', end: 'bottom 35%', scrub: 0.6, onUpdate: (st) => set(st.progress) });
}

/* =========================================================================
   13. Craft swatches as cloth (WebGL), desktop pointers only, loaded lazily
   ========================================================================= */

let fabric = null;
function webglAvailable() {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
function initFabric() {
  const canvas = $('[data-fabric-gl]');
  const figures = $$('[data-swatches] figure');
  if (!canvas || !figures.length) return;
  const capable = webglAvailable() && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 821px)').matches;
  if (!capable) { canvas.remove(); return; }
  const section = figures[0].closest('section');
  const load = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    load.disconnect();
    import('./fabric.js')
      .then(({ mountFabric }) => { fabric = mountFabric(canvas, figures, { still: motion.still }); })
      .catch((error) => console.error('[nitara] fabric failed', error));
  }, { rootMargin: '400px 0px' });
  load.observe(section);
}

/* =========================================================================
   14. Lookbox: open a print and ask about it
   ========================================================================= */

function initLookbox() {
  const box = $('[data-lookbox]');
  if (!box) return;
  const figure = $('[data-lookbox-fig]', box);
  const codesInput = $('[data-codes]');
  let opener = null;

  $$('[data-look]').forEach((button) => button.addEventListener('click', () => {
    opener = button;
    const { code, desc, src, w, h } = button.dataset;
    const image = new Image();
    image.src = src; image.width = w; image.height = h;
    image.alt = `${desc}, style ${code}`;
    figure.replaceChildren(image);
    $('[data-lookbox-code]', box).textContent = code;
    $('[data-lookbox-title]', box).textContent = desc;
    box.dataset.code = code;
    lenis?.stop();
    box.showModal();
  }));

  box.addEventListener('close', () => { lenis?.start(); opener?.focus(); });
  box.addEventListener('click', (event) => { if (event.target === box) box.close(); });
  $('[data-lookbox-close]', box)?.addEventListener('click', () => box.close());
  $('[data-lookbox-ask]', box)?.addEventListener('click', (event) => {
    event.preventDefault();
    // if a thank-you panel is showing from an earlier enquiry, reopen a fresh form first
    const thanks = $('[data-thanks]');
    if (thanks && !thanks.hidden) $('[data-thanks] button')?.click();
    if (codesInput) {
      const codes = codesInput.value.split(',').map((s) => s.trim()).filter(Boolean);
      if (!codes.includes(box.dataset.code)) codes.push(box.dataset.code);
      codesInput.value = codes.join(', ');
    }
    opener = null;
    box.close();
    scrollToTarget($('#contact'));
    window.setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), motion.still ? 0 : 1300);
  });
}

/* =========================================================================
   15. Enquiry form: validated in the page, delivered to our team by FormSubmit

   The request goes to FormSubmit's AJAX endpoint as JSON (https://formsubmit.co/ajax-documentation)
   and arrives in the inbox as a table. Anything that stops it (offline, an error status, a
   {success: "false"} answer, or no reply inside 12 seconds) leaves the visitor's words in the form
   and offers the same enquiry as a mailto: link, so an enquiry is never lost.
   A hidden "_honey" field catches bots: if it has a value we pretend success and send nothing.
   ========================================================================= */

function initEnquiry() {
  const form = $('[data-enquiry]');
  if (!form) return;
  const fields = $('[data-fields]', form);
  const thanks = $('[data-thanks]', form);
  const error = $('[data-error]', form);
  const submit = $('button[type="submit"]', form);
  if (!fields || !thanks || !error || !submit) return;

  const RECIPIENT = 'tarun@nitaraindia.com';
  const ENDPOINT = `https://formsubmit.co/ajax/${RECIPIENT}`;
  const TIMEOUT = 12000;
  const idleLabel = submit.textContent;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let sending = false;

  /** The visitor's answers, trimmed. Optional fields come back as empty strings. */
  const collect = () => {
    const f = form.elements;
    const value = (el) => el.value.trim();
    return {
      name: value(f.name),
      company: value(f.company),
      email: value(f.email),
      phone: value(f.phone),
      interests: $$('input[name="interest"]:checked', form).map((i) => i.value).join(', '),
      codes: value(f.codes),
      message: value(f.message),
    };
  };

  /** The same enquiry as a mailto: link, used as the fallback when sending fails. */
  const mailtoFor = (d) => {
    const lines = [
      `Name: ${d.name}`,
      d.company && `Brand / company: ${d.company}`,
      `Email: ${d.email}`,
      d.phone && `Phone: ${d.phone}`,
      d.interests && `Interested in: ${d.interests}`,
      d.codes && `Style codes: ${d.codes}`,
    ].filter(Boolean);
    const subject = `Enquiry from ${d.company || d.name}`;
    const body = [...lines, '', d.message].join('\n');
    return `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  /** The JSON body FormSubmit expects: readable keys first (empty optional ones left out), then its _options. */
  const payloadFor = (d) => ({
    ...Object.fromEntries([
      ['Name', d.name],
      ['Brand / company', d.company],
      ['email', d.email],   // lowercase: FormSubmit sets Reply-To from a field named "email"
      ['Phone', d.phone],
      ['Interested in', d.interests],
      ['Style codes', d.codes],
      ['Message', d.message],
    ].filter(([, v]) => v)),
    _subject: `Website enquiry from ${d.company || d.name}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: d.email,
    _honey: '',
  });

  /** POST the enquiry. Resolves on success; throws on anything else so the caller can show the fallback. */
  const send = async (d) => {
    const controller = window.AbortController ? new AbortController() : null;
    const timer = window.setTimeout(() => controller?.abort(), TIMEOUT);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payloadFor(d)),
        signal: controller?.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      // FormSubmit answers {success: "true" | "false", message}; accept a real boolean too.
      if (!result || String(result.success) !== 'true') throw new Error(result?.message || 'Not accepted');
    } finally {
      window.clearTimeout(timer);
    }
  };

  const setSending = (on) => {
    sending = on;
    submit.disabled = on;
    submit.textContent = on ? 'Sending…' : idleLabel;
    form.setAttribute('aria-busy', String(on));
  };

  /** Show a message in the alert line. Given the visitor's answers, it also offers the mailto: fallback. */
  const showError = (message, d) => {
    error.hidden = false;
    error.textContent = message;
    if (!d) return;
    const link = document.createElement('a');
    link.href = mailtoFor(d);
    link.textContent = 'Send it from your email app instead';
    error.append(' ', link);
  };

  /** Swap the fields for the thank-you panel. The form is cleared, so nothing the visitor typed stays on a shared screen. */
  const showThanks = (d) => {
    $('[data-thanks-title]', thanks).textContent = `Thank you, ${d.name.split(/\s+/)[0]}.`;
    $('[data-thanks-email]', thanks).textContent = d.email;
    form.reset();
    $$('[aria-invalid]', form).forEach((el) => el.removeAttribute('aria-invalid'));
    error.hidden = true;
    error.textContent = '';
    fields.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  };

  $('[data-again]', thanks)?.addEventListener('click', () => {
    thanks.hidden = true;
    fields.hidden = false;
    form.elements.name.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const f = form.elements;
    const emailValue = f.email.value.trim();
    const invalid = [];
    if (!f.name.value.trim()) invalid.push(f.name);
    if (!emailPattern.test(emailValue)) invalid.push(f.email);
    if (!f.message.value.trim()) invalid.push(f.message);
    [f.name, f.email, f.message].forEach((el) => el.setAttribute('aria-invalid', String(invalid.includes(el))));

    if (invalid.length) {
      showError('Please add your name, a working email and a line about what you’re making, so we can reply.');
      invalid[0].focus();
      return;
    }
    error.hidden = true;

    const data = collect();
    // Honeypot: only a bot fills the hidden field. Look successful, send nothing.
    if (f._honey?.value) { showThanks(data); return; }

    setSending(true);
    let sent = false;
    try {
      await send(data);
      sent = true;
    } catch (reason) {
      console.warn('[nitara] enquiry not sent', reason);
    }
    setSending(false);

    if (sent) {
      showThanks(data);
    } else {
      showError('We couldn’t send your enquiry just now. Please try again.', data);
      submit.focus();
    }
  });
}

/* =========================================================================
   16. Pause motion: one switch in the footer, remembered on this device
   ========================================================================= */

function initMotionToggle() {
  const button = $('[data-motion-toggle]');
  const render = () => {
    if (!button) return;
    button.setAttribute('aria-pressed', String(motion.still));
    $('span', button).textContent = motion.still ? 'Play motion' : 'Pause motion';
    $('use', button).setAttribute('href', motion.still ? '#i-play' : '#i-pause');
  };
  render();
  button?.addEventListener('click', () => motion.set(!motion.still));

  motion.onChange((still) => {
    fabric?.setStill(still);
    if (still) stopSmoothScroll(); else startSmoothScroll();
    if (hasGsap) (still ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume());
    setupReels();
    render();
  });
  reducedMotion.addEventListener?.('change', (event) => { if (event.matches && !motion.still) motion.set(true); });
}

/* ---------------------------------------------------------------------------
   Copy email: each person in the contact card has a Copy button beside their
   address. Uses the async clipboard API, with a textarea fallback for older
   browsers and non-secure previews; the button confirms with "Copied".
   --------------------------------------------------------------------------- */
function initCopyEmail() {
  const buttons = $$('[data-copy]');
  if (!buttons.length) return;
  const fallbackCopy = (text) => {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    area.remove();
    return ok;
  };
  buttons.forEach((button) => {
    const label = button.textContent;
    let timer = 0;
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const text = button.dataset.copy;
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; }
      } catch { ok = false; }
      if (!ok) ok = fallbackCopy(text);
      button.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      button.classList.toggle('is-copied', ok);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => { button.textContent = label; button.classList.remove('is-copied'); }, 1800);
    });
  });
}


/* =========================================================================
   Boot
   ========================================================================= */

startSmoothScroll();
feature('anchors', initAnchors);
feature('header', initHeader);
feature('menu', initMenu);
feature('hero', initHero);
feature('reveals', initReveals);
feature('counters', initCounters);
feature('chapter tags', initChapterTags);
feature('chapter counter', initChapterCounter);
feature('collection line', initCollectionLine);
feature('morph', initMorph);
feature('fabric', initFabric);
feature('lookbox', initLookbox);
feature('enquiry', initEnquiry);
feature('motion toggle', initMotionToggle);
feature('copy email', initCopyEmail);

/* Review toolbar (Agentation): loads on local previews served by site/tools/serve.py,
   including a forwarded preview port, so reviewers can pin change requests to elements.
   Never on the live domains or Vercel previews; site/dev/ is not deployed anyway. */
if (!/(^|\.)(nitaraindia\.com|coutureacraft\.com|vercel\.app)$/.test(location.hostname)) {
  import('/dev/agentation.js').catch((error) => console.warn('[nitara] review toolbar not loaded', error));
}
window.addEventListener('load', () => feature('reels', setupReels));
let resizeTimer = 0;
window.addEventListener('resize', () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => feature('reels', setupReels), 250); });
