// nitara: page behaviour. Everything here enhances a page that already works without it.
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let still = reduce.matches || root.classList.contains('still');
const desktop = () => window.innerWidth > 820;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const { gsap, ScrollTrigger } = window;
const hasGsap = !!(gsap && ScrollTrigger);
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/* ---------------- smooth scroll ---------------- */
let lenis = null;
function startLenis() {
  if (lenis || still || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  if (hasGsap) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis && lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const loop = (t) => { if (lenis) { lenis.raf(t); requestAnimationFrame(loop); } };
    requestAnimationFrame(loop);
  }
}
function stopLenis() { if (lenis) { lenis.destroy(); lenis = null; } }
function scrollToEl(el) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
}
startLenis();

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#top' ? document.body : $(id);
  if (!target) return;
  e.preventDefault();
  closeMenu();
  scrollToEl(target);
  history.replaceState(null, '', id);
  if (id !== '#top') setTimeout(() => { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }, still ? 0 : 900);
});

/* ---------------- the stitched logo ---------------- */
function stitchLogo() {
  const svg = $('[data-stitch-logo]');
  if (!svg) return;
  const clip = $('[data-stitch-clip]', svg), needle = $('[data-stitch-needle]', svg), satin = $('.s-satin', svg);
  if (still || !hasGsap) {
    clip.setAttribute('width', 1600); satin.style.opacity = 1; svg.classList.add('is-sewn'); return;
  }
  clip.setAttribute('width', 0);
  const p = { x: 0 };
  const tl = gsap.timeline({ delay: 0.35 });
  tl.set(needle, { opacity: 1 })
    .to(p, {
      x: 1600, duration: 2.8, ease: 'power1.inOut',
      onUpdate() {
        clip.setAttribute('width', p.x);
        needle.setAttribute('cx', p.x);
        needle.setAttribute('cy', 190 + Math.sin(p.x / 34) * 70);
      },
    })
    .to(needle, { opacity: 0, duration: 0.3 }, '-=0.2')
    .to(satin, { opacity: 1, duration: 1.2, ease: 'power2.out' }, '-=0.6')
    .add(() => svg.classList.add('is-sewn'), '-=0.3')
    .from('.hero__tagline, .hero__lede, .hero__actions', { y: 24, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, 0.9);
  // the thread keeps running slowly, like it's still being pulled through

}
stitchLogo();

/* ---------------- hero tag (WebGL) ---------------- */
let heroTag = null;
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
const tagHost = $('[data-hero-tag]');
if (tagHost && webglOK()) {
  import('./tag3d.js').then(({ mountHeroTag }) => mountHeroTag(tagHost, { still })).then((t) => { heroTag = t; })
    .catch(() => root.classList.add('no-webgl'));
} else {
  root.classList.add('no-webgl');
}
$('[data-tag-flip]')?.addEventListener('click', () => heroTag && heroTag.flip());

/* ---------------- fabric swatches (WebGL) ---------------- */
let fabric = null;
const glCanvas = $('[data-fabric-gl]');
const swatchFigs = $$('[data-swatches] figure');
if (glCanvas && swatchFigs.length && webglOK() && window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 821px)').matches) {
  import('./fabric.js').then(({ mountFabric }) => { fabric = mountFabric(glCanvas, swatchFigs, { still }); }).catch(() => {});
} else if (glCanvas) {
  glCanvas.remove();
}

/* ---------------- arrivals: stitched headings, chapter tags ---------------- */
const arrive = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); arrive.unobserve(e.target); }
}, { threshold: 0.35 });
$$('.reveal-stitch, .chapter__tag').forEach((el) => arrive.observe(el));

/* Chapter tags turn on their string: lift, swing through edge-on, settle on the other face. */
$$('[data-flip]').forEach((wrap) => {
  const tag = $('.tag', wrap);
  const btn = $('.tag__turn', wrap);
  if (!tag) return;
  let anim = null;
  // once the arrival swing has played, release the element so the turn can own its transform
  tag.addEventListener('animationend', () => wrap.classList.add('is-settled'));
  const faceDeg = () => (wrap.classList.contains('is-flipped') ? 180 : 0);
  const rot = (y, z, t) => 'rotateY(' + y + 'deg) rotateZ(' + z + 'deg) translateY(' + t + 'px)';
  function turn() {
    wrap.classList.add('is-settled');
    const from = faceDeg();
    const to = from === 0 ? 180 : 0;
    const dir = to > from ? 1 : -1;
    wrap.classList.toggle('is-flipped', to === 180);
    if (btn) btn.setAttribute('aria-pressed', String(to === 180));
    if (anim) anim.cancel();
    if (still || reduce.matches) {
      anim = tag.animate([{ transform: rot(from, 0, 0) }, { transform: rot(to, 0, 0) }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
      return;
    }
    anim = tag.animate([
      { transform: rot(from, 0, 0), offset: 0 },
      { transform: rot(from + dir * 40, -3 * dir, -12), offset: 0.22, easing: 'ease-in' },
      { transform: rot(from + dir * 90, -5 * dir, -16), offset: 0.45 },
      { transform: rot(to + dir * 14, 2.5 * dir, -4), offset: 0.72 },
      { transform: rot(to - dir * 5, -1 * dir, 0), offset: 0.88 },
      { transform: rot(to, 0, 0), offset: 1 },
    ], { duration: 1150, easing: 'cubic-bezier(.33,0,.2,1)', fill: 'forwards' });
  }
  if (btn) {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', (e) => { e.stopPropagation(); turn(); });
  }
  tag.addEventListener('click', turn);
});

/* ---------------- counter + nav ink ---------------- */
const counter = $('[data-counter]'), cNo = $('[data-counter-no]'), cName = $('[data-counter-name]');
const chapters = $$('[data-chapter]');
const navLinks = $$('.nav__links a');
let currentIdx = -1;
function setChapter(i) {
  if (i === currentIdx || i < 0) return;
  currentIdx = i;
  const el = chapters[i];
  cNo.textContent = String(i).padStart(2, '0') + ' / ' + String(chapters.length - 1).padStart(2, '0');
  cName.textContent = el.dataset.chapter;
  counter.classList.add('is-ticking');
  setTimeout(() => counter.classList.remove('is-ticking'), 380);
  navLinks.forEach((a) => a.setAttribute('aria-current', a.getAttribute('href') === '#' + el.id ? 'true' : 'false'));
}
function inkFor(el) { return el.classList.contains('ground-manila') || el.classList.contains('ground-turmeric') ? 'dark' : 'light'; }
function onScrollState() {
  const mid = window.innerHeight * 0.45;
  let idx = 0, ink = 'light';
  chapters.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.top <= mid) idx = i;
    if (r.top <= 36 && r.bottom > 36) ink = inkFor(el);
  });
  // over the hero photo the nav stays light
  setChapter(idx);
  document.body.dataset.ink = ink;
}
let lastY = window.scrollY;
const nav = $('[data-nav]');
function onScroll() {
  onScrollState();
  const y = window.scrollY;
  nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.9);
  lastY = y;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScrollState();

/* ---------------- horizontal reels (factory, rail) ---------------- */
const pins = [];
function setupPins() {
  pins.forEach((t) => t.kill()); pins.length = 0;
  if (!hasGsap || still || !desktop()) return;
  for (const [wrapSel, trackSel] of [['[data-reel]', '.reel__track'], ['[data-rack]', '[data-rack-list]']]) {
    const wrap = $(wrapSel), track = $(trackSel);
    if (!wrap || !track) continue;
    const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'center center', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    pins.push(tween.scrollTrigger, tween);
  }
  ScrollTrigger.refresh();
}
/* ---------------- the pegged line ---------------- */
const rackList = $('[data-rack-list]'), rackLine = $('[data-rack-line]');
function drawLine() {
  if (!rackList || !rackLine) return;
  if (rackLine.parentElement !== rackList) { rackList.style.position = 'relative'; rackList.prepend(rackLine); }
  const prints = $$('.print', rackList);
  const W = rackList.scrollWidth;
  rackLine.setAttribute('width', W);
  rackLine.setAttribute('viewBox', `0 0 ${W} 120`);
  const y0 = 18;
  let d = `M 0 ${y0 - 6}`;
  let px = 0, py = y0 - 6;
  prints.forEach((li) => {
    const x = li.offsetLeft + li.offsetWidth / 2, y = y0;
    const sag = Math.min(46, Math.max(14, (x - px) * 0.07));
    d += ` Q ${(px + x) / 2} ${Math.max(py, y) + sag} ${x} ${y}`;
    px = x; py = y;
  });
  d += ` Q ${(px + W) / 2} ${y0 + 30} ${W} ${y0 - 6}`;
  $('path', rackLine).setAttribute('d', d);
}
window.addEventListener('load', drawLine);
window.addEventListener('resize', () => requestAnimationFrame(drawLine));
if (hasGsap && !still) {
  const btns = $$('.print__btn');
  const tilts = btns.map((b) => parseFloat(getComputedStyle(b.closest('li')).getPropertyValue('--tilt')) || 0);
  let swing = 0, swingV = 0, lastSY = window.scrollY;
  gsap.ticker.add(() => {
    if (still) return;
    const y = window.scrollY, v = y - lastSY; lastSY = y;
    swingV += (-v * 0.05 - swing * 0.08) ; swingV *= 0.86; swing += swingV;
    swing = Math.max(-7, Math.min(7, swing));
    if (Math.abs(swing) < 0.01 && Math.abs(swingV) < 0.01) return;
    btns.forEach((b, i) => { b.style.transform = `rotate(${tilts[i] + swing * (0.7 + (i % 3) * 0.2)}deg)`; });
  });
}

/* ---------------- sketch to sample ---------------- */
const morph = $('[data-morph]');
if (morph) {
  const set = (p) => { morph.style.setProperty('--wipe', (p * 100).toFixed(2) + '%'); morph.style.setProperty('--wipe-n', p.toFixed(4)); };
  if (hasGsap && !still) {
    ScrollTrigger.create({ trigger: morph, start: 'top 75%', end: 'bottom 35%', scrub: 0.6, onUpdate: (st) => set(st.progress) });
  } else { set(0.5); }
}

window.addEventListener('load', setupPins);
let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(setupPins, 250); });

/* ---------------- figures that count ---------------- */
if (hasGsap && !still) {
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    if (end < 5) return;
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) }) });
    el.textContent = '0';
  });
  // the machine sheet is stamped once it settles
  const stampEl = $('.sheet__stamp');
  if (stampEl) {
    gsap.set(stampEl, { scale: 2.2, opacity: 0 });
    ScrollTrigger.create({ trigger: '.sheet', start: 'top 55%', once: true, onEnter: () => gsap.to(stampEl, { scale: 1, opacity: 0.78, duration: 0.45, ease: 'back.out(2.2)', delay: 0.4 }) });
  }
  // swatches arrive as if being pinned to the board
  $$('.swatch').forEach((li, i) => {
    gsap.from(li, { y: 60, rotate: (i % 2 ? 6 : -6), opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 92%', once: true } });
  });
  // the hero photo drifts slower than the page
  gsap.to('.hero__photo img', { yPercent: 12, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------------- menu ---------------- */
const menu = $('[data-menu]'), menuBtn = $('[data-menu-open]');
function openMenu() { menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); $('a', menu)?.focus(); lenis?.stop(); }
function closeMenu() { if (!menu || menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); lenis?.start(); }
menuBtn?.addEventListener('click', openMenu);
$('[data-menu-close]')?.addEventListener('click', () => { closeMenu(); menuBtn.focus(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

/* ---------------- lookbox ---------------- */
const box = $('[data-lookbox]');
const codesInput = $('[data-codes]');
let lastLook = null;
$$('[data-look]').forEach((btn) => btn.addEventListener('click', () => {
  lastLook = btn;
  const fig = $('[data-lookbox-fig]', box);
  fig.replaceChildren();
  const img = new Image();
  img.src = btn.dataset.src; img.width = btn.dataset.w; img.height = btn.dataset.h;
  fig.append(img);
  img.alt = btn.dataset.desc + ', style ' + btn.dataset.code;
  $('[data-lookbox-code]', box).textContent = btn.dataset.code;
  $('[data-lookbox-title]', box).textContent = btn.dataset.desc;
  box.dataset.code = btn.dataset.code;
  lenis?.stop();
  const wa = $('[data-lookbox-wa]', box);
  if (wa) wa.href = 'https://wa.me/918860606081?text=' + encodeURIComponent(`Hello Nitara, I'd like to know more about style ${btn.dataset.code} (${btn.dataset.desc}).`);
  box.showModal();
}));
box?.addEventListener('close', () => { lenis?.start(); lastLook?.focus(); });
box?.addEventListener('click', (e) => { if (e.target === box) box.close(); });
$('[data-lookbox-close]')?.addEventListener('click', () => box.close());
$('[data-lookbox-ask]')?.addEventListener('click', (e) => {
  e.preventDefault();
  const code = box.dataset.code;
  const list = codesInput.value.split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.includes(code)) list.push(code);
  codesInput.value = list.join(', ');
  lastLook = null;
  box.close();
  scrollToEl($('#contact'));
  setTimeout(() => $('#f-name').focus({ preventScroll: true }), still ? 0 : 1300);
});

/* ---------------- enquiry form → email ---------------- */
const form = $('[data-enquiry]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const err = $('[data-error]', form);
  const f = form.elements;
  const bad = [];
  if (!f.name.value.trim()) bad.push(f.name);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) bad.push(f.email);
  if (!f.message.value.trim()) bad.push(f.message);
  [f.name, f.email, f.message].forEach((el) => el.setAttribute('aria-invalid', bad.includes(el) ? 'true' : 'false'));
  if (bad.length) {
    err.hidden = false;
    err.textContent = 'Please add your name, a working email and a line about what you’re making, so the team can reply.';
    bad[0].focus();
    return;
  }
  err.hidden = true;
  const interests = $$('input[name="interest"]:checked', form).map((i) => i.value).join(', ');
  const head = [
    `Name: ${f.name.value.trim()}`,
    f.company.value.trim() && `Brand / company: ${f.company.value.trim()}`,
    `Email: ${f.email.value.trim()}`,
    f.phone.value.trim() && `Phone / WhatsApp: ${f.phone.value.trim()}`,
    interests && `Interested in: ${interests}`,
    f.codes.value.trim() && `Style codes: ${f.codes.value.trim()}`,
  ].filter(Boolean);
  const lines = [...head, '', f.message.value.trim()];
  const subject = `Sample request from ${f.company.value.trim() || f.name.value.trim()}`;
  window.location.href = `mailto:tarun@nitaraindia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  const btn = $('button[type="submit"]', form);
  btn.textContent = 'Tag sent to your email app';
  setTimeout(() => (btn.textContent = 'Send the tag'), 4000);
});

/* ---------------- pause motion ---------------- */
const motionBtn = $('[data-motion-toggle]');
function applyMotionUI() {
  motionBtn.setAttribute('aria-pressed', String(still));
  $('span', motionBtn).textContent = still ? 'Play motion' : 'Pause motion';
  $('use', motionBtn).setAttribute('href', still ? '#i-play' : '#i-pause');
}
applyMotionUI();
motionBtn?.addEventListener('click', () => {
  still = !still;
  root.classList.toggle('still', still);
  try { localStorage.setItem('nitara-motion', still ? 'off' : 'on'); } catch (e) {}
  heroTag?.setStill(still);
  fabric?.setStill(still);
  if (still) stopLenis(); else startLenis();
  if (hasGsap) still ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  setupPins();
  applyMotionUI();
});
reduce.addEventListener?.('change', (e) => { if (e.matches && !still) motionBtn.click(); });
