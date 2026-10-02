/*
  PIXEL PORTFOLIO
  Fluid spatial pixel field
*/

const CONFIG = {
  pixelCount: 155,

  minPixel: 5,
  maxPixel: 42,

  density: 0.72,

  // Background noise
  noiseScale: 0.012,
  noiseSpeed: 0.00045,

  // Pixel breathing
  flickerAmount: 0.15,
  flickerSpeed: 0.0017,

  // Mouse / touch
  mouseInfluence: 0.22,

  // CRT
  grainAmount: 0.18,

  // NEW: actual floating movement
  driftAmount: 1.0,
  driftSpeed: 0.00035
};


const sections = [
  {
    id: "about",
    label: "ABOUT ME",
    x: 22,
    y: 26,
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

          <p>
            <a href="#" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </p>

          <p>
            <a href="#" target="_blank" rel="noreferrer">
              CV ↗
            </a>
          </p>
        </div>
      </div>
    `
  },

  {
    id: "works",
    label: "WORKS",
    x: 69,
    y: 24,
    size: 31,
    color: "gray",
    surface: "gray",
    content: `
      <h1>Works</h1>

      <div class="work">
        <strong>Söke Alt Havzası — Spatial Analysis</strong>
        <p>
          GIS, landscape units, suitability analysis and spatial data workflows.
        </p>
      </div>

      <div class="work">
        <strong>Çatalan Adventure Park</strong>
        <p>
          Landscape design and spatial planning study.
        </p>
      </div>

      <div class="work">
        <strong>Çekmece Community Center</strong>
        <p>
          Post-disaster reconstruction, 1:1 wood construction
          and collective making.
        </p>
      </div>

      <p>
        More projects can be added here later.
      </p>
    `
  },

  {
    id: "education",
    label: "EDUCATION",
    x: 77,
    y: 64,
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
          <p>
            Landscape architecture, GIS, remote sensing,
            digital fabrication, spatial data,
            computational design and wood construction.
          </p>
        </div>
      </div>
    `
  },

  {
    id: "experience",
    label: "EXPERIENCE",
    x: 24,
    y: 70,
    size: 29,
    color: "gray",
    surface: "black",
    content: `
      <h1>Experience</h1>

      <div class="work">
        <strong>LIDAR / Spatial Analysis Internship</strong>
        <p>
          Point clouds, mesh generation, spatial analysis
          and real-world data workflows.
        </p>
      </div>

      <div class="work">
        <strong>KARMEN Landscape Design Office</strong>
        <p>
          AutoCAD project drawings, dimensioning,
          planting and site visits.
        </p>
      </div>

      <div class="work">
        <strong>İstanbul Planning Agency</strong>
        <p>
          GIS-based planning work around Beyoğlu,
          Kasımpaşa and Haliç using ArcGIS and QGIS.
        </p>
      </div>
    `
  },

  {
    id: "contact",
    label: "CONTACT",
    x: 48,
    y: 79,
    size: 23,
    color: "white",
    surface: "paper",
    content: `
      <h1>Contact</h1>

      <p>
        Email:
        <a href="mailto:your@email.com">
          your@email.com
        </a>
      </p>

      <p>
        LinkedIn:
        <a href="#" target="_blank" rel="noreferrer">
          profile ↗
        </a>
      </p>
    `
  },

  {
    id: "cv",
    label: "CV",
    x: 53,
    y: 40,
    size: 17,
    color: "black",
    surface: "black",
    content: `
      <h1>CV</h1>

      <p>
        Place your CV PDF link here.
      </p>

      <p>
        <a href="#" target="_blank" rel="noreferrer">
          OPEN CV ↗
        </a>
      </p>
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

let W = 0;
let H = 0;

let pixels = [];

let mouse = {
  x: -1000,
  y: -1000,
  active: false
};

let opened = false;


/* --------------------------------------------------
   RESIZE
-------------------------------------------------- */

function resize() {

  dpr = Math.min(window.devicePixelRatio || 1, 2);

  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);

  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  createPixels();
}


/* --------------------------------------------------
   RANDOM / NOISE
-------------------------------------------------- */

function hash(x, y, t = 0) {

  const v =
    Math.sin(
      x * 12.9898 +
      y * 78.233 +
      t * 0.0007
    ) *
    43758.5453;

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

  return (
    a +
    (b - a) * ux +
    (c - a) * uy +
    (a - b - c + d) * ux * uy
  );
}


/* --------------------------------------------------
   CREATE PIXELS
-------------------------------------------------- */

function createPixels() {

  const area = W * H;

  const scale =
    Math.sqrt(area / (1440 * 900));

  const count =
    Math.round(
      CONFIG.pixelCount *
      Math.max(
        0.65,
        Math.min(1.35, scale)
      )
    );

  pixels = [];

  for (let i = 0; i < count; i++) {

    const x = Math.random() * W;
    const y = Math.random() * H;

    const size =
      CONFIG.minPixel +
      Math.pow(Math.random(), 2.1) *
      CONFIG.maxPixel;

    pixels.push({

      x,
      y,

      size,

      phase:
        Math.random() *
        Math.PI *
        2,

      speed:
        0.6 +
        Math.random() *
        1.6,

      alpha:
        0.3 +
        Math.random() *
        0.7,

      seed:
        Math.random() * 1000,

      tone:
        Math.random() < 0.53
          ? 255
          : 75 + Math.random() * 130,

      /* NEW */

      angle:
        Math.random() *
        Math.PI *
        2,

      drift:
        0.25 +
        Math.random() * 1.0,

      orbit:
        0.3 +
        Math.random() * 1.3,

      offsetX:
        Math.random() * 1000,

      offsetY:
        Math.random() * 1000
    });
  }
}


/* --------------------------------------------------
   DRAW FIELD
-------------------------------------------------- */

function drawField(time) {

  ctx.clearRect(
    0,
    0,
    W,
    H
  );


  /* BACKGROUND */

  const bg =
    ctx.createRadialGradient(
      W * 0.5,
      H * 0.5,
      0,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.75
    );

  bg.addColorStop(
    0,
    "#171717"
  );

  bg.addColorStop(
    1,
    "#030303"
  );

  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* PIXELS */

  for (const p of pixels) {

    const n =
      smoothNoise(
        p.x,
        p.y,
        time * CONFIG.noiseSpeed
      );


    /*
      REAL FLOATING MOTION

      Each pixel gets its own
      slow orbit / drift.
    */

    const driftTime =
      time *
      CONFIG.driftSpeed *
      p.speed;


    const floatX =
      Math.sin(
        driftTime +
        p.offsetX
      ) *
      28 *
      p.drift;


    const floatY =
      Math.cos(
        driftTime * 0.83 +
        p.offsetY
      ) *
      22 *
      p.drift;


    const secondaryX =
      Math.sin(
        driftTime * 0.43 +
        p.phase
      ) *
      9 *
      p.orbit;


    const secondaryY =
      Math.cos(
        driftTime * 0.37 +
        p.phase
      ) *
      9 *
      p.orbit;


    let px =
      p.x +
      floatX +
      secondaryX;

    let py =
      p.y +
      floatY +
      secondaryY;


    /*
      WRAP AROUND SCREEN

      Pixels leaving one side
      quietly enter from the other.
    */

    if (px < -60) px = W + 60;
    if (px > W + 60) px = -60;

    if (py < -60) py = H + 60;
    if (py > H + 60) py = -60;


    /* MOUSE */

    const distance =
      mouse.active
        ? Math.hypot(
            px - mouse.x,
            py - mouse.y
          )
        : 9999;


    const influence =
      mouse.active
        ? Math.max(
            0,
            1 - distance / 280
          ) *
          CONFIG.mouseInfluence
        : 0;


    /*
      Pixels gently react
      to cursor.
    */

    const mouseDX =
      mouse.active
        ? (px - mouse.x) *
          influence *
          0.045
        : 0;

    const mouseDY =
      mouse.active
        ? (py - mouse.y) *
          influence *
          0.045
        : 0;


    /* BREATHING */

    const pulse =
      1 +
      Math.sin(
        time *
          CONFIG.flickerSpeed *
          p.speed +
          p.phase
      ) *
      CONFIG.flickerAmount;


    const size =
      p.size *
      pulse *
      (1 + influence * 1.8);


    let threshold =
      0.46 +
      (n - 0.5) *
      CONFIG.density;


    threshold +=
      Math.sin(
        time *
          CONFIG.noiseSpeed *
          1.4 +
          p.seed
      ) *
      0.03;


    const light =
      threshold > 0.5;


    const base =
      light
        ? 244
        : p.tone;


    const alpha =
      Math.min(
        1,
        p.alpha *
        (0.48 + n * 0.72)
      );


    ctx.globalAlpha = alpha;

    ctx.fillStyle =
      `rgb(${base},${base},${base})`;


    ctx.fillRect(

      Math.round(
        px +
        mouseDX -
        size / 2
      ),

      Math.round(
        py +
        mouseDY -
        size / 2
      ),

      Math.max(
        1,
        Math.round(size)
      ),

      Math.max(
        1,
        Math.round(size)
      )
    );
  }


  ctx.globalAlpha = 1;


  /* --------------------------------------------------
     FINE CRT GRAIN
  -------------------------------------------------- */

  if (CONFIG.grainAmount > 0) {

    const grainCount =
      Math.floor(
        W *
        H /
        4200 *
        CONFIG.grainAmount
      );


    for (
      let i = 0;
      i < grainCount;
      i++
    ) {

      const x =
        Math.random() * W;

      const y =
        Math.random() * H;


      const value =
        Math.random() > 0.5
          ? 255
          : 20;


      const alpha =
        Math.random() * 0.09;


      ctx.fillStyle =
        `rgba(
          ${value},
          ${value},
          ${value},
          ${alpha}
        )`;


      ctx.fillRect(
        Math.floor(x),
        Math.floor(y),
        1,
        1
      );
    }
  }


  requestAnimationFrame(
    drawField
  );
}


/* --------------------------------------------------
   BUILD INTERACTIVE PIXELS
-------------------------------------------------- */

function buildNodes() {

  nodeLayer.innerHTML = "";


  sections.forEach(
    (section, index) => {

      const button =
        document.createElement("button");


      button.className =
        "pixel-node";


      button.type =
        "button";


      button.dataset.id =
        section.id;


      button.style.left =
        `${section.x}%`;


      button.style.top =
        `${section.y}%`;


      /*
        Responsive size.

        The original pixel size
        becomes the reference,
        but the CSS will scale it
        according to viewport.
      */

      button.style.setProperty(
        "--size",
        `${section.size}px`
      );


      button.style.setProperty(
        "--delay",
        `${index * -0.47}s`
      );


      button.style.setProperty(
        "--speed",
        `${3.5 + (index % 4) * 0.65}s`
      );


      const isWhite =
        section.color === "white";


      button.style.setProperty(
        "--node-color",

        isWhite
          ? "#f4f4f0"
          : section.color === "black"
            ? "#050505"
            : "#777"
      );


      button.style.setProperty(
        "--node-text",

        isWhite
          ? "#050505"
          : "#f4f4f0"
      );


      const label =
        document.createElement("span");


      label.textContent =
        section.label;


      button.appendChild(
        label
      );


      button.addEventListener(
        "pointerenter",
        () => {
          button.classList.add(
            "is-hovered"
          );
        }
      );


      button.addEventListener(
        "pointerleave",
        () => {
          button.classList.remove(
            "is-hovered"
          );
        }
      );


      button.addEventListener(
        "click",
        () => {
          openSection(
            section,
            button
          );
        }
      );


      nodeLayer.appendChild(
        button
      );
    }
  );
}


/* --------------------------------------------------
   OPEN SECTION
-------------------------------------------------- */

function openSection(
  section,
  button
) {

  if (opened) return;

  opened = true;


  const rect =
    button.getBoundingClientRect();


  sectionSurface.style.setProperty(
    "--origin-x",
    `${rect.left + rect.width / 2}px`
  );


  sectionSurface.style.setProperty(
    "--origin-y",
    `${rect.top + rect.height / 2}px`
  );


  sectionSurface.className =
    `section-surface ${section.surface}`;


  sectionContent.innerHTML =
    section.content;


  sectionLayer.classList.add(
    "open"
  );


  sectionLayer.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.cursor =
    "default";
}


/* --------------------------------------------------
   CLOSE
-------------------------------------------------- */

function closeSection() {

  if (!opened) return;


  sectionLayer.classList.remove(
    "open"
  );


  sectionLayer.setAttribute(
    "aria-hidden",
    "true"
  );


  opened = false;


  document.body.style.cursor =
    "crosshair";
}


/* --------------------------------------------------
   POINTER
-------------------------------------------------- */

window.addEventListener(
  "pointermove",
  event => {

    mouse.x =
      event.clientX;

    mouse.y =
      event.clientY;

    mouse.active =
      true;
  }
);


window.addEventListener(
  "pointerleave",
  () => {
    mouse.active = false;
  }
);


/* --------------------------------------------------
   TOUCH
-------------------------------------------------- */

window.addEventListener(
  "touchmove",
  event => {

    if (
      event.touches &&
      event.touches.length
    ) {

      mouse.x =
        event.touches[0].clientX;

      mouse.y =
        event.touches[0].clientY;

      mouse.active =
        true;
    }
  },
  { passive: true }
);


window.addEventListener(
  "touchend",
  () => {
    mouse.active = false;
  }
);


/* --------------------------------------------------
   KEYBOARD
-------------------------------------------------- */

window.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {
      closeSection();
    }
  }
);


/* --------------------------------------------------
   EVENTS
-------------------------------------------------- */

closeButton.addEventListener(
  "click",
  closeSection
);


window.addEventListener(
  "resize",
  resize
);


/* --------------------------------------------------
   START
-------------------------------------------------- */

resize();

buildNodes();

requestAnimationFrame(
  drawField
);
