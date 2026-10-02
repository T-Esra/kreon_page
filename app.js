/* =========================================================
   ESRA TÖLE
   PIXEL PORTFOLIO ENGINE
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {

  /*
   * Background particle count.
   * Automatically adjusted according to screen size.
   */
  particleDensity: 0.00020,

  minParticles: 180,
  maxParticles: 620,

  /*
   * Particle movement
   */
  movementSpeed: 0.35,
  flowStrength: 0.85,

  /*
   * Mouse interaction
   */
  mouseRadius: 240,
  mouseForce: 0.95,

  /*
   * Particle appearance
   */
  minSize: 1,
  maxSize: 8,

  /*
   * CRT grain generated directly on canvas
   */
  grainStrength: 0.22,

  /*
   * FPS safety
   */
  targetFPS: 55
};


/* =========================================================
   PORTFOLIO SECTIONS
   ========================================================= */

const sections = [

  {
    id: "about",
    label: "ABOUT ME",
    x: 22,
    y: 27,
    size: 76,
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
    x: 70,
    y: 24,
    size: 78,
    color: "gray",
    surface: "gray",

    content: `
      <h1>Works</h1>

      <div class="work">
        <strong>
          Söke Alt Havzası — Spatial Analysis
        </strong>

        <p>
          GIS, landscape units, suitability analysis and spatial
          data workflows.
        </p>
      </div>

      <div class="work">
        <strong>
          Çatalan Adventure Park
        </strong>

        <p>
          Landscape design and spatial planning study.
        </p>
      </div>

      <div class="work">
        <strong>
          Çekmece Community Center
        </strong>

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
    size: 88,
    color: "black",
    surface: "black",

    content: `
      <h1>Education</h1>

      <div class="content-grid">

        <div>
          <h2>Çukurova University</h2>

          <p>
            Department of Landscape Architecture
          </p>

          <p>
            2022 — 2027
          </p>
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
    x: 23,
    y: 69,
    size: 86,
    color: "gray",
    surface: "black",

    content: `
      <h1>Experience</h1>

      <div class="work">
        <strong>
          LIDAR / Spatial Analysis Internship
        </strong>

        <p>
          Point clouds, mesh generation, spatial analysis
          and real-world data workflows.
        </p>
      </div>

      <div class="work">
        <strong>
          KARMEN Landscape Design Office
        </strong>

        <p>
          AutoCAD project drawings, dimensioning,
          planting and site visits.
        </p>
      </div>

      <div class="work">
        <strong>
          İstanbul Planning Agency
        </strong>

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
    x: 49,
    y: 80,
    size: 68,
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
    x: 52,
    y: 42,
    size: 62,
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


/* =========================================================
   DOM
   ========================================================= */

const canvas =
  document.getElementById("pixelCanvas");

const ctx =
  canvas.getContext("2d", {
    alpha: false
  });

const nodeLayer =
  document.getElementById("pixelNodes");

const sectionLayer =
  document.getElementById("sectionLayer");

const sectionSurface =
  document.getElementById("sectionSurface");

const sectionContent =
  document.getElementById("sectionContent");

const sectionLabel =
  document.getElementById("sectionLabel");

const closeButton =
  document.getElementById("closeButton");


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let W = 0;
let H = 0;

let dpr = 1;

let particles = [];

let opened = false;

let activeSection = null;

let lastTime = 0;

let fpsCounter = 0;

let fpsTime = 0;


/* =========================================================
   POINTER STATE
   ========================================================= */

const pointer = {

  x: -9999,
  y: -9999,

  previousX: -9999,
  previousY: -9999,

  velocityX: 0,
  velocityY: 0,

  active: false
};


/* =========================================================
   RANDOM HELPERS
   ========================================================= */

function random(min, max) {
  return Math.random() * (max - min) + min;
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function lerp(a, b, amount) {
  return a + (b - a) * amount;
}


/* =========================================================
   CREATE PARTICLES
   ========================================================= */

function createParticles() {

  const area = W * H;

  let count =
    Math.floor(area * CONFIG.particleDensity);

  count = clamp(
    count,
    CONFIG.minParticles,
    CONFIG.maxParticles
  );


  particles = new Array(count);


  for (let i = 0; i < count; i++) {

    particles[i] = {

      x: random(0, W),
      y: random(0, H),

      vx: random(-0.18, 0.18),
      vy: random(-0.18, 0.18),

      baseSize:
        random(
          CONFIG.minSize,
          CONFIG.maxSize
        ),

      size:
        random(
          CONFIG.minSize,
          CONFIG.maxSize
        ),

      alpha:
        random(.18, .82),

      phase:
        random(0, Math.PI * 2),

      frequency:
        random(.00035, .0012),

      drift:
        random(.3, 1.3),

      seed:
        random(0, 10000),

      brightness:
        random(.35, 1)
    };
  }
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize() {

  dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  W = window.innerWidth;
  H = window.innerHeight;


  canvas.width =
    Math.floor(W * dpr);

  canvas.height =
    Math.floor(H * dpr);

  canvas.style.width =
    `${W}px`;

  canvas.style.height =
    `${H}px`;


  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  createParticles();
}


/* =========================================================
   PARTICLE FLOW FIELD
   ========================================================= */

function flowAngle(x, y, time, seed) {

  const a =
    Math.sin(
      x * 0.0021 +
      time * 0.00019 +
      seed
    );

  const b =
    Math.cos(
      y * 0.0017 -
      time * 0.00015 +
      seed * 1.7
    );

  const c =
    Math.sin(
      (x + y) * 0.0008 +
      time * 0.00012
    );


  return (
    a * 1.4 +
    b * 1.2 +
    c * .9
  );
}


/* =========================================================
   UPDATE PARTICLES
   ========================================================= */

function updateParticles(time, delta) {

  const dt =
    Math.min(delta, 32);


  for (const p of particles) {

    /*
     * Organic flow
     */

    const angle =
      flowAngle(
        p.x,
        p.y,
        time,
        p.seed
      );


    const flowX =
      Math.cos(angle) *
      CONFIG.flowStrength *
      p.drift;

    const flowY =
      Math.sin(angle) *
      CONFIG.flowStrength *
      p.drift;


    p.vx =
      lerp(
        p.vx,
        flowX * .025,
        .025
      );

    p.vy =
      lerp(
        p.vy,
        flowY * .025,
        .025
      );


    /*
     * Slow natural movement
     */

    p.x +=
      p.vx *
      CONFIG.movementSpeed *
      dt;

    p.y +=
      p.vy *
      CONFIG.movementSpeed *
      dt;


    /*
     * Mouse / touch force
     */

    if (pointer.active) {

      const dx =
        p.x - pointer.x;

      const dy =
        p.y - pointer.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance > 0 &&
        distance < CONFIG.mouseRadius
      ) {

        const normalized =
          1 -
          distance /
          CONFIG.mouseRadius;

        const force =
          normalized *
          normalized *
          CONFIG.mouseForce;


        /*
         * Push away from pointer
         */

        p.vx +=
          (dx / distance) *
          force *
          .018;

        p.vy +=
          (dy / distance) *
          force *
          .018;


        /*
         * Pointer movement creates flow
         */

        p.vx +=
          pointer.velocityX *
          normalized *
          .0008;

        p.vy +=
          pointer.velocityY *
          normalized *
          .0008;
      }
    }


    /*
     * Velocity damping
     */

    p.vx *= .992;
    p.vy *= .992;


    /*
     * Soft breathing
     */

    p.size =
      p.baseSize *
      (
        1 +
        Math.sin(
          time * p.frequency +
          p.phase
        ) *
        .35
      );


    /*
     * Screen wrapping
     */

    const margin = 30;


    if (p.x < -margin) {
      p.x = W + margin;
    }

    if (p.x > W + margin) {
      p.x = -margin;
    }

    if (p.y < -margin) {
      p.y = H + margin;
    }

    if (p.y > H + margin) {
      p.y = -margin;
    }
  }
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground() {

  /*
   * Deep CRT background
   */

  const gradient =
    ctx.createRadialGradient(
      W * .5,
      H * .48,
      0,
      W * .5,
      H * .48,
      Math.max(W, H) * .8
    );


  gradient.addColorStop(
    0,
    "#171717"
  );

  gradient.addColorStop(
    .42,
    "#0b0b0b"
  );

  gradient.addColorStop(
    1,
    "#000000"
  );


  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );
}


/* =========================================================
   DRAW PARTICLES
   ========================================================= */

function drawParticles(time) {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  for (const p of particles) {

    const flicker =
      .72 +
      Math.sin(
        time * p.frequency * 2 +
        p.phase
      ) *
      .28;


    const alpha =
      p.alpha *
      flicker;


    const brightness =
      Math.floor(
        90 +
        p.brightness *
        165
      );


    ctx.fillStyle =
      `rgba(
        ${brightness},
        ${brightness},
        ${brightness},
        ${alpha}
      )`;


    const size =
      Math.max(
        .7,
        p.size
      );


    /*
     * Tiny square particles
     */

    ctx.fillRect(
      Math.round(p.x),
      Math.round(p.y),
      Math.ceil(size),
      Math.ceil(size)
    );
  }


  ctx.restore();
}


/* =========================================================
   EXTRA STATIC
   ========================================================= */

function drawStatic() {

  const amount =
    Math.floor(
      W * H * CONFIG.grainStrength / 850
    );


  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const x =
      Math.random() * W;

    const y =
      Math.random() * H;


    const brightness =
      Math.random() > .5
        ? 255
        : 55;


    const alpha =
      Math.random() * .16;


    ctx.fillStyle =
      `rgba(
        ${brightness},
        ${brightness},
        ${brightness},
        ${alpha}
      )`;


    const size =
      Math.random() > .96
        ? 2
        : 1;


    ctx.fillRect(
      x,
      y,
      size,
      size
    );
  }


  ctx.restore();
}


/* =========================================================
   HORIZONTAL CRT GLITCHES
   ========================================================= */

function drawGlitches(time) {

  /*
   * Small amount of moving horizontal noise.
   */

  if (
    Math.random() > .88
  ) {

    const y =
      Math.random() * H;

    const height =
      Math.random() * 2 + 1;

    const alpha =
      Math.random() * .12;


    ctx.fillStyle =
      `rgba(
        255,
        255,
        255,
        ${alpha}
      )`;


    ctx.fillRect(
      0,
      y,
      W,
      height
    );
  }


  /*
   * Very subtle vertical interference.
   */

  if (
    Math.random() > .94
  ) {

    const x =
      Math.random() * W;

    const width =
      random(1, 4);


    ctx.fillStyle =
      "rgba(255,255,255,.08)";


    ctx.fillRect(
      x,
      0,
      width,
      H
    );
  }
}


/* =========================================================
   MAIN ANIMATION
   ========================================================= */

function animate(time) {

  if (!lastTime) {
    lastTime = time;
  }


  const delta =
    time - lastTime;


  lastTime = time;


  updateParticles(
    time,
    delta
  );


  drawBackground();

  drawParticles(time);

  drawStatic();

  drawGlitches(time);


  /*
   * FPS monitor
   */

  fpsCounter++;

  if (
    time - fpsTime > 1000
  ) {

    const fps =
      fpsCounter;

    fpsCounter = 0;

    fpsTime = time;


    /*
     * If device is struggling,
     * reduce particles.
     */

    if (
      fps < CONFIG.targetFPS &&
      particles.length >
      CONFIG.minParticles
    ) {

      particles.splice(
        0,
        Math.floor(
          particles.length * .08
        )
      );
    }
  }


  requestAnimationFrame(
    animate
  );
}


/* =========================================================
   POINTER MOVEMENT
   ========================================================= */

function updatePointer(x, y) {

  if (
    pointer.x > -900
  ) {

    pointer.velocityX =
      x - pointer.x;

    pointer.velocityY =
      y - pointer.y;
  }


  pointer.previousX =
    pointer.x;

  pointer.previousY =
    pointer.y;

  pointer.x = x;
  pointer.y = y;

  pointer.active = true;
}


window.addEventListener(
  "pointermove",
  event => {

    updatePointer(
      event.clientX,
      event.clientY
    );
  },
  {
    passive: true
  }
);


window.addEventListener(
  "pointerleave",
  () => {

    pointer.active = false;

    pointer.x = -9999;
    pointer.y = -9999;
  }
);


/* =========================================================
   TOUCH
   ========================================================= */

window.addEventListener(
  "touchmove",
  event => {

    if (
      !event.touches.length
    ) {
      return;
    }


    const touch =
      event.touches[0];


    updatePointer(
      touch.clientX,
      touch.clientY
    );

  },
  {
    passive: true
  }
);


window.addEventListener(
  "touchend",
  () => {

    pointer.active = false;

  },
  {
    passive: true
  }
);


/* =========================================================
   BUILD MENU
   ========================================================= */

function buildNodes() {

  nodeLayer.innerHTML = "";


  sections.forEach(
    (section, index) => {

      const button =
        document.createElement("button");


      button.type = "button";

      button.className =
        "pixel-node";


      button.dataset.id =
        section.id;


      button.style.left =
        `${section.x}%`;


      button.style.top =
        `${section.y}%`;


      /*
       * Responsive pixel size
       */

      button.style.setProperty(
        "--size",
        `${section.size}px`
      );


      button.style.setProperty(
        "--node-delay",
        `${index * -.45}s`
      );


      button.style.setProperty(
        "--node-speed",
        `${3.5 + index * .32}s`
      );


      /*
       * Colors
       */

      let nodeColor;
      let nodeText;


      if (
        section.color === "white"
      ) {

        nodeColor =
          "#f4f4ef";

        nodeText =
          "#050505";

      } else if (
        section.color === "black"
      ) {

        nodeColor =
          "#050505";

        nodeText =
          "#f4f4ef";

      } else {

        nodeColor =
          "#777777";

        nodeText =
          "#f4f4ef";
      }


      button.style.setProperty(
        "--node-color",
        nodeColor
      );


      button.style.setProperty(
        "--node-text",
        nodeText
      );


      /*
       * Label
       */

      const label =
        document.createElement("span");


      label.textContent =
        section.label;


      button.appendChild(
        label
      );


      /*
       * Mouse hover
       */

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


      /*
       * Click
       */

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


/* =========================================================
   OPEN SECTION
   ========================================================= */

function openSection(
  section,
  button
) {

  if (opened) {
    return;
  }


  opened = true;

  activeSection =
    section;


  /*
   * Get clicked pixel position
   */

  const rect =
    button.getBoundingClientRect();


  const originX =
    rect.left +
    rect.width / 2;


  const originY =
    rect.top +
    rect.height / 2;


  /*
   * Set animation origin
   */

  sectionSurface.style.setProperty(
    "--origin-x",
    `${originX}px`
  );


  sectionSurface.style.setProperty(
    "--origin-y",
    `${originY}px`
  );


  /*
   * Apply surface
   */

  sectionSurface.className =
    `section-surface ${section.surface}`;


  /*
   * Section title
   */

  sectionLabel.textContent =
    section.label;


  /*
   * Content
   */

  sectionContent.innerHTML =
    section.content;


  /*
   * Open
   */

  sectionLayer.classList.add(
    "open"
  );


  sectionLayer.setAttribute(
    "aria-hidden",
    "false"
  );


  /*
   * Stop main interaction
   */

  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   CLOSE SECTION
   ========================================================= */

function closeSection() {

  if (!opened) {
    return;
  }


  sectionLayer.classList.remove(
    "open"
  );


  sectionLayer.setAttribute(
    "aria-hidden",
    "true"
  );


  opened = false;

  activeSection = null;


  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

closeButton.addEventListener(
  "click",
  closeSection
);


/* =========================================================
   ESCAPE
   ========================================================= */

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


/* =========================================================
   RESIZE
   ========================================================= */

let resizeTimer = null;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        resize,
        120
      );
  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

resize();

buildNodes();

requestAnimationFrame(
  animate
);
