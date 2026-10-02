/*
  PIXEL PORTFOLIO
  Experimental portfolio engine.

  The visual field is intentionally parameterized so the aesthetic can be
  changed later without rebuilding the site architecture.
*/

const CONFIG = {
  pixelCount: 155,
  minPixel: 5,
  maxPixel: 42,
  density: 0.72,
  noiseScale: 0.012,
  noiseSpeed: 0.00045,
  flickerAmount: 0.18,
  flickerSpeed: 0.0017,
  mouseInfluence: 0.18,
  grainAmount: 0.12
};

const sections = [
  {
    id: "about",
    label: "ABOUT ME",
    x: 22, y: 26,
    size: 38,
    color: "white",
    surface: "paper",
    content: `
      <h1>About Me</h1>
      <div class="content-grid">
        <div>
          <h2>Esra Töle</h2>
          <p>
            Landscape Architecture student interested in spatial data,
            digital environments, visual experimentation, GIS and
            interdisciplinary forms of making.
          </p>
        </div>
        <div>
          <h2>Links</h2>
          <p><a href="#" target="_blank" rel="noreferrer">LinkedIn ↗</a></p>
          <p><a href="#" target="_blank" rel="noreferrer">CV ↗</a></p>
        </div>
      </div>
    `
  },
  {
    id: "works",
    label: "WORKS",
    x: 69, y: 24,
    size: 31,
    color: "gray",
    surface: "gray",
    content: `
      <h1>Works</h1>
      <div class="work">
        <strong>Söke Alt Havzası — Spatial Analysis</strong>
        <p>GIS, landscape units, suitability analysis and spatial data workflows.</p>
      </div>
      <div class="work">
        <strong>Çatalan Adventure Park</strong>
        <p>Landscape design and spatial planning study.</p>
      </div>
      <div class="work">
        <strong>Çekmece Community Center</strong>
        <p>Post-disaster reconstruction, 1:1 wood construction and collective making.</p>
      </div>
      <p>More projects can be added here later.</p>
    `
  },
  {
    id: "education",
    label: "EDUCATION",
    x: 77, y: 64,
    size: 45,
    color: "black",
    surface: "black",
    content: `
      <h1>Education</h1>
      <div class="content-grid">
        <div>
          <h2>Çukurova University</h2>
          <p>Department of Landscape Architecture</p>
          <p>2022 — 2027</p>
        </div>
        <div>
          <h2>Interests</h2>
          <p>Landscape architecture, GIS, remote sensing, digital fabrication, spatial data, computational design and wood construction.</p>
        </div>
      </div>
    `
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    x: 24, y: 70,
    size: 29,
    color: "gray",
    surface: "black",
    content: `
      <h1>Experience</h1>
      <div class="work">
        <strong>LIDAR / Spatial Analysis Internship</strong>
        <p>Point clouds, mesh generation, spatial analysis and real-world data workflows.</p>
      </div>
      <div class="work">
        <strong>KARMEN Landscape Design Office</strong>
        <p>AutoCAD project drawings, dimensioning, planting and site visits.</p>
      </div>
      <div class="work">
        <strong>İstanbul Planning Agency</strong>
        <p>GIS-based planning work around Beyoğlu, Kasımpaşa and Haliç using ArcGIS and QGIS.</p>
      </div>
    `
  },
  {
    id: "contact",
    label: "CONTACT",
    x: 48, y: 79,
    size: 23,
    color: "white",
    surface: "paper",
    content: `
      <h1>Contact</h1>
      <p>Email: <a href="mailto:your@email.com">your@email.com</a></p>
      <p>LinkedIn: <a href="#" target="_blank" rel="noreferrer">profile ↗</a></p>
    `
  },
  {
    id: "cv",
    label: "CV",
    x: 53, y: 40,
    size: 17,
    color: "black",
    surface: "black",
    content: `
      <h1>CV</h1>
      <p>Place your CV PDF link here.</p>
      <p><a href="#" target="_blank" rel="noreferrer">OPEN CV ↗</a></p>
    `
  }
];

const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const nodeLayer = document.getElementById("pixelNodes");
const sectionLayer = document.getElementById("sectionLayer");
const sectionSurface = document.getElementById("sectionSurface");
const sectionContent = document.getElementById("sectionContent");
const closeButton = document.getElementById("closeButton");

let dpr = Math.min(window.devicePixelRatio || 1, 2);
let W = 0, H = 0;
let pixels = [];
let mouse = { x: -1000, y: -1000, active: false };
let opened = false;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createPixels();
}

function hash(x, y, t = 0) {
  const v = Math.sin(x * 12.9898 + y * 78.233 + t * 0.0007) * 43758.5453;
  return v - Math.floor(v);
}

function smoothNoise(x, y, t) {
  const s = CONFIG.noiseScale;
  const x0 = Math.floor(x * s);
  const y0 = Math.floor(y * s);
  const fx = x * s - x0;
  const fy = y * s - y0;
  const a = hash(x0, y0, t);
  const b = hash(x0 + 1, y0, t);
  const c = hash(x0, y0 + 1, t);
  const d = hash(x0 + 1, y0 + 1, t);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function createPixels() {
  const area = W * H;
  const scale = Math.sqrt(area / (1440 * 900));
  const count = Math.round(CONFIG.pixelCount * Math.max(.65, Math.min(1.35, scale)));
  pixels = [];

  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const size = CONFIG.minPixel + Math.pow(Math.random(), 2.1) * CONFIG.maxPixel;
    pixels.push({
      x, y, size,
      phase: Math.random() * Math.PI * 2,
      speed: .6 + Math.random() * 1.6,
      alpha: .3 + Math.random() * .7,
      seed: Math.random() * 1000,
      tone: Math.random() < .53 ? 255 : (75 + Math.random() * 130)
    });
  }
}

function drawField(time) {
  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createRadialGradient(W*.5, H*.5, 0, W*.5, H*.5, Math.max(W,H)*.75);
  bg.addColorStop(0, "#171717");
  bg.addColorStop(1, "#030303");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (const p of pixels) {
    const n = smoothNoise(p.x, p.y, time * CONFIG.noiseSpeed);
    const pulse = 1 + Math.sin(time * CONFIG.flickerSpeed * p.speed + p.phase) * CONFIG.flickerAmount;
    const distance = mouse.active
      ? Math.hypot(p.x - mouse.x, p.y - mouse.y)
      : 9999;
    const influence = mouse.active
      ? Math.max(0, 1 - distance / 260) * CONFIG.mouseInfluence
      : 0;

    const size = p.size * pulse * (1 + influence * 1.8);
    const dx = mouse.active
      ? (p.x - mouse.x) * influence * .035
      : 0;
    const dy = mouse.active
      ? (p.y - mouse.y) * influence * .035
      : 0;

    let threshold = .46 + (n - .5) * CONFIG.density;
    threshold += Math.sin(time * CONFIG.noiseSpeed * 1.4 + p.seed) * .03;

    const light = threshold > .5;
    const base = light ? 244 : p.tone;
    const alpha = Math.min(1, p.alpha * (.48 + n * .72));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgb(${base},${base},${base})`;
    ctx.fillRect(
      Math.round(p.x + dx - size/2),
      Math.round(p.y + dy - size/2),
      Math.max(1, Math.round(size)),
      Math.max(1, Math.round(size))
    );
  }

  ctx.globalAlpha = 1;

  // Fine CRT grain.
  if (CONFIG.grainAmount > 0) {
    const grainCount = Math.floor(W * H / 6500 * CONFIG.grainAmount);
    for (let i = 0; i < grainCount; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const v = Math.random() > .5 ? 255 : 30;
      ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * .11})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  requestAnimationFrame(drawField);
}

function buildNodes() {
  nodeLayer.innerHTML = "";

  sections.forEach((section, index) => {
    const button = document.createElement("button");
    button.className = "pixel-node";
    button.type = "button";
    button.dataset.id = section.id;
    button.style.left = `${section.x}%`;
    button.style.top = `${section.y}%`;
    button.style.setProperty("--size", `${section.size}px`);
    button.style.setProperty("--delay", `${index * -.47}s`);
    button.style.setProperty("--speed", `${3.5 + (index % 4) * .65}s`);

    const isWhite = section.color === "white";
    button.style.setProperty("--node-color", isWhite ? "#f4f4f0" : section.color === "black" ? "#050505" : "#777");
    button.style.setProperty("--node-text", isWhite ? "#050505" : "#f4f4f0");

    const label = document.createElement("span");
    label.textContent = section.label;
    button.appendChild(label);

    button.addEventListener("pointerenter", () => button.classList.add("is-hovered"));
    button.addEventListener("pointerleave", () => button.classList.remove("is-hovered"));
    button.addEventListener("click", () => openSection(section, button));

    nodeLayer.appendChild(button);
  });
}

function openSection(section, button) {
  if (opened) return;
  opened = true;

  const rect = button.getBoundingClientRect();
  sectionSurface.style.setProperty("--origin-x", `${rect.left + rect.width / 2}px`);
  sectionSurface.style.setProperty("--origin-y", `${rect.top + rect.height / 2}px`);
  sectionSurface.className = `section-surface ${section.surface}`;
  sectionContent.innerHTML = section.content;

  sectionLayer.classList.add("open");
  sectionLayer.setAttribute("aria-hidden", "false");
  document.body.style.cursor = "default";
}

function closeSection() {
  if (!opened) return;
  sectionLayer.classList.remove("open");
  sectionLayer.setAttribute("aria-hidden", "true");
  opened = false;
  document.body.style.cursor = "crosshair";
}

window.addEventListener("pointermove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.active = true;
});

window.addEventListener("pointerleave", () => {
  mouse.active = false;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSection();
});

closeButton.addEventListener("click", closeSection);
window.addEventListener("resize", resize);

resize();
buildNodes();
requestAnimationFrame(drawField);
