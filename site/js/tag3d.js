// The hero hang tag: a manila card on a cotton string, swinging under real pendulum physics.
// Drag to swing, click to turn it over. Front: the brand. Back: the capabilities.
import * as THREE from '../vendor/three.module.min.js';

const MANILA = '#D6AC67';
const INK = '#1A2238';
const MADDER = '#A42E28';

let PAPER = null; // real kraft paper grain, loaded before the faces are drawn
let STAMP = null; // real rubber-stamp impression, if produced
function paperTexture(ctx, w, h) {
  ctx.fillStyle = MANILA;
  ctx.fillRect(0, 0, w, h);
  if (PAPER) {
    const s = Math.max(w / PAPER.width, h / PAPER.height);
    ctx.drawImage(PAPER, (w - PAPER.width * s) / 2, (h - PAPER.height * s) / 2, PAPER.width * s, PAPER.height * s);
    return;
  }
  // paper fibre: short strokes in slightly darker and lighter manila
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * w, y = Math.random() * h, l = 4 + Math.random() * 14, a = Math.random() * Math.PI;
    ctx.strokeStyle = Math.random() > .5 ? 'rgba(120,84,30,.10)' : 'rgba(255,240,205,.16)';
    ctx.lineWidth = .8 + Math.random();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
}

function tagPath(ctx, w, h, inset) {
  const c = 0.22, s = 0.12; // chamfer sizes, as fractions
  ctx.beginPath();
  ctx.moveTo(w * c + inset, inset);
  ctx.lineTo(w * (1 - c) - inset, inset);
  ctx.lineTo(w - inset, h * s * .55 + inset);
  ctx.lineTo(w - inset, h - inset);
  ctx.lineTo(inset, h - inset);
  ctx.lineTo(inset, h * s * .55 + inset);
  ctx.closePath();
}

function stamp(ctx, x, y, r, text) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.22);
  ctx.strokeStyle = MADDER; ctx.fillStyle = MADDER; ctx.globalAlpha = .86;
  ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r - 14, 0, Math.PI * 2); ctx.stroke();
  ctx.font = '700 40px "Courier Prime", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = text.split(' ');
  ctx.fillText(words.slice(0, 2).join(' '), 0, -18);
  ctx.fillText(words.slice(2).join(' '), 0, 30);
  ctx.restore();
}

function drawFace(side) {
  const w = 1000, h = 1650;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  paperTexture(ctx, w, h);
  // running-stitch border
  ctx.setLineDash([26, 16]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(26,34,56,.38)';
  tagPath(ctx, w, h, 34); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const L = 100;
  if (side === 'front') {
    ctx.font = '700 34px "Courier Prime", monospace';
    ctx.fillText('N I T A R A   I N D I A', L, 330);
    ctx.font = '400 150px "Rozha One", Georgia, serif';
    ctx.fillText('Elevating', L - 6, 520);
    ctx.fillText('couture', L - 6, 660);
    ctx.fillStyle = MADDER;
    ctx.fillText('to artistry.', L - 6, 800);
    ctx.fillStyle = INK;
    ctx.setLineDash([18, 12]); ctx.lineWidth = 3; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(L, 880); ctx.lineTo(w - L, 880); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '400 40px "Courier Prime", monospace';
    const rows = [['SINCE', 'the 1980s'], ['ORIGIN', 'Noida, India'], ['MADE', 'by hand & machine'], ['FOR', 'labels worldwide']];
    rows.forEach(([k, v], i) => {
      ctx.fillStyle = MADDER; ctx.fillText(k, L, 960 + i * 64);
      ctx.fillStyle = INK; ctx.fillText(v, L + 210, 960 + i * 64);
    });
    if (STAMP) { ctx.save(); ctx.translate(w - 250, h - 260); ctx.rotate(-0.2); ctx.globalAlpha = .9; const s = 330 / Math.max(STAMP.width, STAMP.height); ctx.drawImage(STAMP, -STAMP.width * s / 2, -STAMP.height * s / 2, STAMP.width * s, STAMP.height * s); ctx.restore(); }
    else stamp(ctx, w - 250, h - 260, 150, 'WORK WITH US');
    // stitched barcode
    for (let i = 0; i < 34; i++) {
      const bw = [3, 5, 8][i % 3];
      ctx.fillStyle = INK; ctx.fillRect(L + i * 13, h - 230, bw, 110);
    }
    ctx.font = '400 30px "Courier Prime", monospace';
    ctx.fillText('nitaraindia.com', L, h - 80);
  } else {
    ctx.font = '700 38px "Courier Prime", monospace';
    ctx.fillStyle = MADDER;
    ctx.fillText('W H A T   W E   D O', L, 320);
    ctx.fillStyle = INK;
    ctx.font = '400 104px "Rozha One", Georgia, serif';
    ctx.fillText('Design, craft', L - 4, 450);
    ctx.fillText('& manufacture', L - 4, 560);
    ctx.font = '700 50px "Hanken Grotesk", Arial, sans-serif';
    const items = ['Design studio & CAD', 'Hand embroidery & adda', 'Chikan & dori, 24 heads', 'Digital print, 16 heads', 'Tie & dye, washes', 'Laser cut & hot-fix', 'Women’s & kids’ wear'];
    items.forEach((t, i) => {
      ctx.fillStyle = MADDER; ctx.fillRect(L, 668 + i * 80, 18, 18);
      ctx.fillStyle = INK; ctx.fillText(t, L + 44, 690 + i * 80);
    });
    ctx.setLineDash([18, 12]); ctx.lineWidth = 3; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(L, 1270); ctx.lineTo(w - L, 1270); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '700 54px "Courier Prime", monospace';
    ctx.fillText('+91 120 426 7008', L, 1370);
    ctx.font = '700 44px "Courier Prime", monospace';
    ctx.fillText('tarun@nitaraindia.com', L, 1445);
    ctx.fillText('E-63, Sector 63, Noida', L, 1515);
  }
  // punch the eyelet area dark so the brass ring sits on a real hole
  ctx.fillStyle = '#121830';
  ctx.beginPath(); ctx.arc(w / 2, h * 0.073, 30, 0, Math.PI * 2); ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export async function mountHeroTag(host, { still = false } = {}) {
  const paper = new Image();
  paper.src = new URL('../img/texture/manila-paper.webp', import.meta.url).href;
  try {
    await Promise.all([
      document.fonts.load('150px "Rozha One"'), document.fonts.load('700 40px "Courier Prime"'), document.fonts.load('400 40px "Courier Prime"'), document.fonts.load('700 50px "Hanken Grotesk"'),
      paper.decode().then(() => { PAPER = paper; }),
      (async () => { const st = new Image(); st.src = new URL('../img/art/stamp-workwithus.webp', import.meta.url).href; try { await st.decode(); STAMP = st; } catch (e) {} })(),
    ]);
  } catch (e) { /* fonts and paper are optional; the tag still draws */ }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x1b2440, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
  sun.position.set(-2.5, 3, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -3; sun.shadow.camera.right = 3; sun.shadow.camera.top = 3; sun.shadow.camera.bottom = -3;
  sun.shadow.radius = 8; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.002;
  scene.add(sun);

  // shadow catcher on the photo behind
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.ShadowMaterial({ opacity: 0.32 }));
  catcher.position.z = -0.55; catcher.receiveShadow = true; scene.add(catcher);

  // tag geometry: chamfered card with an eyelet hole, origin at the eyelet
  const W = 1.0, H = 1.65, c = 0.22, s = 0.12;
  const shape = new THREE.Shape();
  const top = 0.12; // eyelet sits this far below the top edge
  shape.moveTo(-W / 2 + W * c, top);
  shape.lineTo(W / 2 - W * c, top);
  shape.lineTo(W / 2, top - H * s * .55);
  shape.lineTo(W / 2, top - H);
  shape.lineTo(-W / 2, top - H);
  shape.lineTo(-W / 2, top - H * s * .55);
  shape.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.032, 0, Math.PI * 2, true); shape.holes.push(hole);

  const faceGeo = new THREE.ShapeGeometry(shape, 24);
  // UVs from the card bounds
  const pos = faceGeo.attributes.position, uv = faceGeo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + W / 2) / W, (pos.getY(i) - (top - H)) / H);
  }
  const frontTex = drawFace('front'), backTex = drawFace('back');
  const mat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.88, metalness: 0, side: THREE.FrontSide });
  const front = new THREE.Mesh(faceGeo, mat(frontTex));
  front.position.z = 0.0085; front.castShadow = true;
  const backGeo = faceGeo.clone();
  const back = new THREE.Mesh(backGeo, mat(backTex));
  back.rotation.y = Math.PI; back.position.z = -0.0085; back.castShadow = true;
  // mirror back UVs so text reads correctly when turned
  // no UV mirroring: once the card turns 180° the back face sits in the front's orientation and reads left to right
  const edge = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: false, curveSegments: 24 }),
    new THREE.MeshStandardMaterial({ color: 0xb48c4c, roughness: 0.9 })
  );
  edge.position.z = -0.007;

  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a14a, metalness: 0.85, roughness: 0.32 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.014, 14, 40), brass);
  ring.castShadow = true;

  const card = new THREE.Group();
  card.add(front, back, edge, ring);

  // string from anchor to eyelet (inside the swinging pivot)
  const L = 1.12;
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xf3ede3, roughness: 1 });
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, L + 0.4, 8), stringMat);
  string.position.y = -(L + 0.4) / 2 + 0.4; string.castShadow = true;
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.0065, 8, 30, Math.PI * 1.25), stringMat);
  loop.rotation.set(Math.PI / 2, 0, Math.PI * 1.4); loop.position.set(0, -L + 0.02, 0);

  const pivot = new THREE.Group();
  card.position.y = -L;
  pivot.add(string, loop, card);
  scene.add(pivot);

  // ---- layout ----
  let vw = 1, vh = 1, mobile = false;
  function resize() {
    const r = host.getBoundingClientRect();
    vw = Math.max(1, r.width); vh = Math.max(1, r.height);
    mobile = window.innerWidth <= 820;
    renderer.setSize(vw, vh, false);
    renderer.domElement.style.width = vw + 'px'; renderer.domElement.style.height = vh + 'px';
    camera.aspect = vw / vh;
    camera.position.z = mobile ? 5.2 : 6;
    camera.updateProjectionMatrix();
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    pivot.position.set(mobile ? 0.25 : 0.32, halfH + 0.06, 0);
    pivot.scale.setScalar(mobile ? 0.92 : 0.84);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- physics ----
  let theta = still ? 0.04 : -0.26, omega = 0;       // swing about the anchor
  let phi = still ? 0 : 0.32, phiV = 0, phiT = 0;    // twist about the string
  const g = 9.8, damp = 0.9;
  let dragging = false, dragTheta = 0, lastX = 0, lastT = 0, downX = 0, downY = 0, moved = false;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function hit(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects([front, back, edge], false).length > 0;
  }
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => {
    if (!hit(e)) { el.style.pointerEvents = 'none'; requestAnimationFrame(() => (el.style.pointerEvents = '')); return; }
    dragging = true; moved = false; downX = lastX = e.clientX; downY = e.clientY; lastT = performance.now();
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    el.style.cursor = hit(e) ? 'grab' : 'default';
    if (!dragging) return;
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) moved = true;
    const now = performance.now(), dt = Math.max(1, now - lastT);
    const dx = e.clientX - lastX;
    dragTheta = THREE.MathUtils.clamp(theta + dx / vw * 2.2, -1.1, 1.1);
    omega = (dx / vw) * 2.2 / (dt / 1000);
    lastX = e.clientX; lastT = now;
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    if (!moved) flip();
    try { el.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);

  function flip() { phiT = phiT === 0 ? Math.PI : 0; phiV += 1.2; }
  function nudge(v) { if (!still) omega += v; }

  // breeze from pointer movement anywhere over the hero
  let px = null;
  host.parentElement.addEventListener('pointermove', (e) => {
    if (px !== null && !dragging) nudge(THREE.MathUtils.clamp((e.clientX - px) / 900, -0.06, 0.06));
    px = e.clientX;
  });

  let running = true, raf = 0, last = performance.now();
  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (!running) return;
    if (dragging) {
      theta += (dragTheta - theta) * 0.35;
    } else if (!still) {
      const alpha = -(g / (L * 1.6)) * Math.sin(theta) - damp * 0.55 * omega;
      omega += alpha * dt; theta += omega * dt;
    } else {
      theta += (0.04 - theta) * 0.1;
    }
    // twist spring toward the face we want to show
    const pa = -14 * (phi - phiT) - 3.2 * phiV + (still ? 0 : Math.sin(now / 1700) * 0.25);
    phiV += pa * dt; phi += phiV * dt;
    pivot.rotation.z = theta;
    card.rotation.y = phi;
    card.rotation.x = Math.sin(theta) * 0.18;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(step);

  const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: 0 });
  io.observe(host);

  return {
    flip,
    nudge,
    setStill(v) { still = v; },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); el.remove(); },
  };
}
