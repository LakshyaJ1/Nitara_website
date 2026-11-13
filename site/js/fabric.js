// Craft swatches rendered as cloth: the real garment photos ripple, catch light in their folds,
// bulge under the cursor and flutter with scroll speed. One shared canvas tracks the DOM swatches.
import * as THREE from '../vendor/three.module.min.js';

const vert = /* glsl */`
  uniform float uTime, uHover, uVel, uSeed;
  uniform vec2 uMouse, uSize;
  varying vec2 vUv;
  varying float vShade;
  float wave(vec2 p, float t) {
    return sin(p.x * 5.0 + t * 1.3 + uSeed) * 0.55
         + sin(p.y * 4.2 - t * 1.05 + uSeed * 2.0) * 0.45
         + sin((p.x + p.y) * 9.0 + t * 2.1) * 0.18;
  }
  void main() {
    vUv = uv;
    vec3 p = position;
    float t = uTime;
    float amp = 0.35 + uHover * 1.1;
    float h = wave(uv, t) * amp;
    float d = distance(uv, uMouse);
    float bulge = exp(-d * d * 14.0) * uHover;
    h += bulge * 2.2;
    // pinned at the top centre: less movement near the pin
    float pin = smoothstep(0.0, 0.55, distance(uv, vec2(0.5, 1.0)));
    h *= pin;
    // shading from the local slope (fake light from the upper left)
    float e = 0.01;
    float hx = (wave(uv + vec2(e, 0.0), t) - wave(uv - vec2(e, 0.0), t)) / (2.0 * e) * amp;
    float hy = (wave(uv + vec2(0.0, e), t) - wave(uv - vec2(0.0, e), t)) / (2.0 * e) * amp;
    vShade = clamp(1.0 + (-hx * 0.6 + hy * 0.4) * 0.05 * pin + bulge * 0.06, 0.82, 1.14);
    // displace in the picture plane (orthographic): folds pull the cloth slightly
    // displacement measured in pixels, converted to the unit plane
    p.x += hx * 1.6 * pin / uSize.x;
    p.y += (hy * 1.6 * pin + sin(uv.x * 3.14159) * clamp(uVel, -1.5, 1.5) * 14.0 * (1.0 - uv.y)) / uSize.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */`
  uniform sampler2D uTex;
  uniform vec2 uCover; // uv scale for object-fit: cover
  uniform vec2 uSize;  // plane size in px
  varying vec2 vUv;
  varying float vShade;
  void main() {
    // pinked top & bottom edges, 20px teeth, 12px deep (matches the CSS mask)
    float teeth = uSize.x / 20.0;
    float tri = abs(fract(vUv.x * teeth) - 0.5) * 2.0; // 0 at tooth tip, 1 at valley
    float depth = 12.0 / uSize.y;
    if (vUv.y > 1.0 - depth * (1.0 - tri)) discard;
    if (vUv.y < depth * tri) discard;
    vec2 uv = (vUv - 0.5) * uCover + 0.5;
    vec4 c = texture2D(uTex, uv);
    c.rgb *= vShade;
    gl_FragColor = c;
  }
`;

export function mountFabric(canvas, figures, { still = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -100, 100);
  const loader = new THREE.TextureLoader();

  const items = figures.map((fig, i) => {
    const img = fig.querySelector('img');
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true,
      uniforms: {
        uTex: { value: null }, uTime: { value: 0 }, uHover: { value: 0 }, uVel: { value: 0 },
        uMouse: { value: new THREE.Vector2(.5, .5) }, uSize: { value: new THREE.Vector2(1, 1) },
        uCover: { value: new THREE.Vector2(1, 1) }, uSeed: { value: i * 1.7 },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 48, 48), mat);
    mesh.visible = false;
    scene.add(mesh);
    const item = { fig, img, mesh, mat, hover: 0, target: 0, ready: false, aspect: 1 };
    loader.load(img.currentSrc || img.src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.uniforms.uTex.value = tex;
      item.aspect = tex.image.width / tex.image.height;
      item.ready = true;
      if (items.every((it) => it.ready)) document.documentElement.classList.add('gl-on');
    });
    const li = fig.closest('li');
    li.addEventListener('pointerenter', () => (item.target = 1));
    li.addEventListener('pointerleave', () => (item.target = 0));
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      mat.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    });
    return item;
  });

  let W = 1, H = 1;
  function resize() {
    W = document.documentElement.clientWidth; H = document.documentElement.clientHeight;
    renderer.setSize(W, H, false);
    camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = -H;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let vel = 0, lastY = window.scrollY;
  let active = false, raf = 0;
  const t0 = performance.now();
  function frame(now) {
    raf = active ? requestAnimationFrame(frame) : 0;
    const y = window.scrollY;
    vel += ((y - lastY) / 40 - vel) * 0.12; lastY = y;
    const t = still ? 0 : (now - t0) / 1000;
    for (const it of items) {
      if (!it.ready) continue;
      const r = it.fig.getBoundingClientRect();
      const vis = r.bottom > -50 && r.top < H + 50;
      it.mesh.visible = vis;
      if (!vis) continue;
      const w = it.fig.offsetWidth, h = it.fig.offsetHeight;
      const tilt = parseFloat(getComputedStyle(it.fig.closest('li')).getPropertyValue('--tilt')) || 0;
      it.hover += (it.target - it.hover) * 0.08;
      const u = it.mat.uniforms;
      u.uTime.value = t; u.uHover.value = still ? 0 : it.hover; u.uVel.value = still ? 0 : vel;
      u.uSize.value.set(w, h);
      const pa = w / h;
      u.uCover.value.set(pa > it.aspect ? 1 : pa / it.aspect, pa > it.aspect ? it.aspect / pa : 1);
      it.mesh.scale.set(w, h, 1);
      it.mesh.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
      it.mesh.rotation.z = -tilt * Math.PI / 180;
    }
    renderer.render(scene, camera);
  }

  const section = figures[0].closest('section');
  const io = new IntersectionObserver(([e]) => {
    active = e.isIntersecting;
    canvas.style.visibility = active ? 'visible' : 'hidden';
    if (active && !raf) raf = requestAnimationFrame(frame);
  }, { rootMargin: '100px 0px' });
  io.observe(section);

  return { setStill(v) { still = v; } };
}
