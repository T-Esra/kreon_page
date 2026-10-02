"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

  /* Background particle amount */
  particleDensity: 0.00024,

  minParticles: 220,
  maxParticles: 700,

  /* Movement */
  movementSpeed: 0.42,
  flowStrength: 1.0,

  /* Mouse */
  mouseRadius: 260,
  mouseForce: 1.2,

  /* Particle size */
  minSize: 1,
  maxSize: 11,

  /* CRT */
  staticStrength: 1.0,
  glitchChance: 0.16
};


/* =========================================================
   SECTIONS
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
   STATE
   ========================================================= */

let W = 0;
let H = 0;

let dpr = 1;

let particles = [];

let opened = false;

let lastTime = 0;

let fpsFrames = 0;
let fpsTimer = 0;


/* =========================================================
   POINTER
   ========================================================= */

const pointer = {

  x: -9999,
  y: -9999,

  oldX: -9999,
  oldY: -9999,

  vx: 0,
  vy: 0,

  active: false
};


/* =========================================================
   HELPERS
   ========================================================= */

function random(min, max) {
  return Math.random() * (max - min) + min;
}


function clamp(value, min, max) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}


function lerp(a, b, amount) {
  return a + (b - a) * amount;
}


/* =========================================================
   CREATE PARTICLES
   ========================================================= */

function createParticles() {

  const area =
    W * H;


  let count =
    Math.floor(
      area *
      CONFIG.particleDensity
    );


  count =
    clamp(
      count,
      CONFIG.minParticles,
      CONFIG.maxParticles
    );


  particles =
    new Array(count);


  for (
    let i = 0;
    i < count;
    i++
  ) {

    /*
     * Weighted size distribution.
     *
     * Most particles are small.
     * Some are medium.
     * A few are large.
     */

    const sizeRandom =
      Math.pow(
        Math.random(),
        1.7
      );


    const baseSize =
      CONFIG.minSize +
      sizeRandom *
      (
        CONFIG.maxSize -
        CONFIG.minSize
      );


    particles[i] = {

      x:
        random(0, W),

      y:
        random(0, H),

      vx:
        random(-.18, .18),

      vy:
        random(-.18, .18),

      baseSize,

      size:
        baseSize,

      phase:
        random(0, Math.PI * 2),

      seed:
        random(0, 10000),

      drift:
        random(.45, 1.5),

      alpha:
        random(.20, .95),

      brightness:
        random(.3, 1),

      pulseSpeed:
        random(.0005, .0018)
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


  W =
    window.innerWidth;

  H =
    window.innerHeight;


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
   FLOW FIELD
   ========================================================= */

function getFlowAngle(
  x,
  y,
  time,
  seed
) {

  const a =
    Math.sin(
      x * .0021 +
      time * .00018 +
      seed
    );


  const b =
    Math.cos(
      y * .0018 -
      time * .00014 +
      seed * 1.7
    );


  const c =
    Math.sin(
      (x + y) * .0008 +
      time * .00011
    );


  return (
    a * 1.5 +
    b * 1.25 +
    c
  );
}


/* =========================================================
   UPDATE PARTICLES
   ========================================================= */

function updateParticles(
  time,
  delta
) {

  const dt =
    Math.min(
      delta,
      32
    );


  for (
    const p of particles
  ) {

    const angle =
      getFlowAngle(
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


    /*
     * Smooth natural movement
     */

    p.vx =
      lerp(
        p.vx,
        flowX * .035,
        .025
      );


    p.vy =
      lerp(
        p.vy,
        flowY * .035,
        .025
      );


    /*
     * Mouse interaction
     */

    if (pointer.active) {

      const dx =
        p.x -
        pointer.x;

      const dy =
        p.y -
        pointer.y;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance > 0 &&
        distance <
        CONFIG.mouseRadius
      ) {

        const influence =
          1 -
          distance /
          CONFIG.mouseRadius;


        const force =
          influence *
          influence *
          CONFIG.mouseForce;


        p.vx +=
          (dx / distance) *
          force *
          .025;


        p.vy +=
          (dy / distance) *
          force *
          .025;


        /*
         * Pointer movement
         * creates an extra current.
         */

        p.vx +=
          pointer.vx *
          influence *
          .001;


        p.vy +=
          pointer.vy *
          influence *
          .001;
      }
    }


    /*
     * Move
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
     * Damping
     */

    p.vx *= .992;
    p.vy *= .992;


    /*
     * Dynamic size.
     *
     * This is what makes the field
     * feel alive instead of static.
     */

    const pulse =
      Math.sin(
        time *
        p.pulseSpeed +
        p.phase
      );


    const pulseAmount =
      .35 +
      p.drift * .12;


    p.size =
      p.baseSize *
      (
        1 +
        pulse *
        pulseAmount
      );


    /*
     * Wrap around screen
     */

    const margin = 40;


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
   BACKGROUND
   ========================================================= */

function drawBackground() {

  const gradient =
    ctx.createRadialGradient(
      W * .5,
      H * .48,
      0,
      W * .5,
      H * .48,
      Math.max(W, H) * .85
    );


  gradient.addColorStop(
    0,
    "#181818"
  );


  gradient.addColorStop(
    .35,
    "#0c0c0c"
  );


  gradient.addColorStop(
    .72,
    "#030303"
  );


  gradient.addColorStop(
    1,
    "#000000"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    W,
    H
  );
}


/* =========================================================
   PARTICLES
   ========================================================= */

function drawParticles(time) {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  for (
    const p of particles
  ) {

    const flicker =
      .65 +
      Math.sin(
        time *
        p.pulseSpeed *
        2 +
        p.phase
      ) *
      .35;


    const alpha =
      p.alpha *
      flicker;


    const brightness =
      Math.floor(
        70 +
        p.brightness *
        185
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
        .6,
        p.size
      );


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
   HEAVY CRT STATIC
   ========================================================= */

function drawStatic() {

  /*
   * Number of static pixels.
   */

  const amount =
    Math.floor(
      W *
      H *
      .00055 *
      CONFIG.staticStrength
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
      Math.random() *
      W;

    const y =
      Math.random() *
      H;


    const bright =
      Math.random();


    let value;


    if (bright > .92) {

      value =
        255;

    } else if (bright > .45) {

      value =
        random(120, 220);

    } else {

      value =
        random(20, 90);
    }


    const alpha =
      random(.05, .26);


    ctx.fillStyle =
      `rgba(
        ${value},
        ${value},
        ${value},
        ${alpha}
      )`;


    const size =
      Math.random() >
      .97
        ? random(2, 4)
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
   CRT HORIZONTAL INTERFERENCE
   ========================================================= */

function drawCRTInterference() {

  /*
   * Many tiny horizontal lines.
   */

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  const lines =
    Math.floor(
      H / 8
    );


  for (
    let i = 0;
    i < lines;
    i++
  ) {

    if (
      Math.random() >
      .30
    ) {
      continue;
    }


    const y =
      Math.random() *
      H;


    const width =
      random(
        W * .02,
        W * .45
      );


    const x =
      random(
        0,
        W - width
      );


    const alpha =
      random(.025, .14);


    ctx.fillStyle =
      `rgba(
        255,
        255,
        255,
        ${alpha}
      )`;


    ctx.fillRect(
      x,
      y,
      width,
      random(.5, 2)
    );
  }


  ctx.restore();
}


/* =========================================================
   BIG CRT GLITCH
   ========================================================= */

function drawGlitch() {

  if (
    Math.random() >
    CONFIG.glitchChance
  ) {
    return;
  }


  const y =
    random(
      0,
      H
    );


  const height =
    random(
      1,
      7
    );


  const shift =
    random(
      -40,
      40
    );


  ctx.save();


  ctx.globalAlpha =
    random(
      .08,
      .28
    );


  ctx.drawImage(
    canvas,
    0,
    y,
    W,
    height,
    shift,
    y,
    W,
    height
  );


  ctx.restore();
}


/* =========================================================
   ANIMATION
   ========================================================= */

function animate(time) {

  if (!lastTime) {
    lastTime = time;
  }


  const delta =
    time -
    lastTime;


  lastTime =
    time;


  updateParticles(
    time,
    delta
  );


  drawBackground();

  drawParticles(time);

  drawStatic();

  drawCRTInterference();

  drawGlitch();


  /*
   * FPS protection
   */

  fpsFrames++;


  if (
    time -
    fpsTimer >
    1000
  ) {

    const fps =
      fpsFrames;


    fpsFrames = 0;

    fpsTimer =
      time;


    if (
      fps < 45 &&
      particles.length >
      CONFIG.minParticles
    ) {

      particles.splice(
        0,
        Math.floor(
          particles.length *
          .07
        )
      );
    }
  }


  requestAnimationFrame(
    animate
  );
}


/* =========================================================
   POINTER
   ========================================================= */

function updatePointer(
  x,
  y
) {

  if (
    pointer.x > -900
  ) {

    pointer.vx =
      x -
      pointer.x;

    pointer.vy =
      y -
      pointer.y;
  }


  pointer.oldX =
    pointer.x;

  pointer.oldY =
    pointer.y;


  pointer.x =
    x;

  pointer.y =
    y;


  pointer.active =
    true;
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

    pointer.active =
      false;

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

    pointer.active =
      false;

  },
  {
    passive: true
  }
);


/* =========================================================
   BUILD INFORMATION PIXELS
   ========================================================= */

function buildNodes() {

  nodeLayer.innerHTML =
    "";


  sections.forEach(
    (section, index) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "pixel-node";


      button.style.left =
        `${section.x}%`;


      button.style.top =
        `${section.y}%`;


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
        `${3.2 + index * .35}s`
      );


      let nodeColor;
      let nodeText;


      if (
        section.color ===
        "white"
      ) {

        nodeColor =
          "#f4f4ef";

        nodeText =
          "#050505";

      } else if (
        section.color ===
        "black"
      ) {

        nodeColor =
          "#050505";

        nodeText =
          "#f4f4ef";

      } else {

        nodeColor =
          "#777";

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


      const label =
        document.createElement(
          "span"
        );


      label.textContent =
        section.label;


      button.appendChild(
        label
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


/* =========================================================
   OPEN POPUP
   ========================================================= */

function openSection(
  section,
  button
) {

  if (opened) {
    return;
  }


  opened =
    true;


  const rect =
    button.getBoundingClientRect();


  /*
   * Center of clicked pixel
   */

  const pixelX =
    rect.left +
    rect.width / 2;


  const pixelY =
    rect.top +
    rect.height / 2;


  /*
   * Popup size
   */

  const isMobile =
    window.innerWidth <= 700;


  const popupWidth =
    Math.min(
      620,
      window.innerWidth -
      (isMobile ? 28 : 40)
    );


  const popupHeight =
    Math.min(
      isMobile
        ? window.innerHeight * .72
        : window.innerHeight * .72,
      720
    );


  /*
   * Try to position popup near
   * clicked pixel.
   */

  let left =
    pixelX +
    35;


  let top =
    pixelY -
    popupHeight / 2;


  /*
   * If right side doesn't fit,
   * put it on the left.
   */

  if (
    left +
    popupWidth >
    window.innerWidth -
    15
  ) {

    left =
      pixelX -
      popupWidth -
      35;
  }


  /*
   * If left side doesn't fit,
   * center it.
   */

  if (
    left < 15
  ) {

    left =
      (
        window.innerWidth -
        popupWidth
      ) / 2;
  }


  /*
   * Vertical correction.
   */

  if (
    top < 15
  ) {

    top =
      15;
  }


  if (
    top +
    popupHeight >
    window.innerHeight -
    15
  ) {

    top =
      window.innerHeight -
      popupHeight -
      15;
  }


  /*
   * Convert to percentages
   * because surface is centered.
   */

  const centerX =
    left +
    popupWidth / 2;


  const centerY =
    top +
    popupHeight / 2;


  /*
   * Origin inside popup.
   * This makes it look like
   * the pixel grows into the window.
   */

  const originX =
    pixelX -
    left;


  const originY =
    pixelY -
    top;


  /*
   * Position popup.
   */

  sectionSurface.style.left =
    `${centerX}px`;


  sectionSurface.style.top =
    `${centerY}px`;


  sectionSurface.style.width =
    `${popupWidth}px`;


  sectionSurface.style.maxHeight =
    `${popupHeight}px`;


  sectionSurface.style.setProperty(
    "--origin-x",
    `${originX}px`
  );


  sectionSurface.style.setProperty(
    "--origin-y",
    `${originY}px`
  );


  /*
   * Surface color
   */

  sectionSurface.className =
    `section-surface ${section.surface}`;


  /*
   * Label
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
}


/* =========================================================
   CLOSE
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


  opened =
    false;


  /*
   * Small delay so next opening
   * starts cleanly.
   */

  setTimeout(
    () => {

      if (!opened) {

        sectionSurface.style.width =
          "";

        sectionSurface.style.maxHeight =
          "";
      }

    },
    350
  );
}


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

closeButton.addEventListener(
  "click",
  closeSection
);


/* =========================================================
   ESC
   ========================================================= */

window.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeSection();
    }
  }
);


/* =========================================================
   RESIZE
   ========================================================= */

let resizeTimer;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      resizeTimer
    );


    resizeTimer =
      setTimeout(
        resize,
        100
      );
  }
);


/* =========================================================
   START
   ========================================================= */

resize();

buildNodes();

requestAnimationFrame(
  animate
);
