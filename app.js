"use strict";

/* =========================================================
   PIXEL PORTFOLIO — ACTIVE / LIQUID VERSION
   ========================================================= */

const CONFIG = {

  /* Daha fazla ve daha büyük parçacık */
  particleDensity: 0.00032,

  minParticles: 260,
  maxParticles: 850,

  /* Çok daha hızlı akış */
  movementSpeed: 0.78,
  flowStrength: 1.8,

  /* Mouse etkisi */
  mouseRadius: 330,
  mouseForce: 2.2,

  /* PARÇACIK BOYUTLARI */
  minSize: 2,
  maxSize: 24,

  /* CRT */
  staticStrength: 1.8,
  glitchChance: 0.24
};


/* =========================================================
   INFORMATION SECTIONS
   ========================================================= */

const sections = [

  {
    id: "about",
    label: "ABOUT ME",
    x: 22,
    y: 27,
    size: 82,
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
    size: 86,
    color: "gray",
    surface: "gray",

    content: `
      <h1>Works</h1>

      <div class="work">
        <strong>Söke Alt Havzası — Spatial Analysis</strong>
        <p>
          GIS, landscape units, suitability analysis and spatial
          data workflows.
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
    `
  },


  {
    id: "education",
    label: "EDUCATION",
    x: 77,
    y: 64,
    size: 96,
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
    x: 23,
    y: 69,
    size: 92,
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
    x: 49,
    y: 80,
    size: 76,
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
    size: 68,
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
  canvas.getContext("2d", { alpha: false });

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
let nodes = [];

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
  return Math.max(min, Math.min(max, value));
}


function lerp(a, b, amount) {
  return a + (b - a) * amount;
}


/* =========================================================
   PARTICLE CREATION
   ========================================================= */

function createParticles() {

  const area = W * H;

  let count =
    Math.floor(
      area * CONFIG.particleDensity
    );

  count = clamp(
    count,
    CONFIG.minParticles,
    CONFIG.maxParticles
  );

  particles = new Array(count);


  for (let i = 0; i < count; i++) {

    /*
     * Boyut dağılımı:
     *
     * %55 küçük
     * %30 orta
     * %15 büyük
     */

    const r = Math.random();

    let baseSize;

    if (r < 0.55) {

      baseSize =
        random(2, 7);

    } else if (r < 0.85) {

      baseSize =
        random(6, 15);

    } else {

      baseSize =
        random(14, 26);
    }


    particles[i] = {

      x: random(0, W),
      y: random(0, H),

      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),

      baseSize,

      size: baseSize,

      phase:
        random(0, Math.PI * 2),

      seed:
        random(0, 10000),

      drift:
        random(0.7, 2.2),

      alpha:
        random(0.22, 0.95),

      brightness:
        random(0.25, 1),

      pulseSpeed:
        random(0.0007, 0.0025)
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
   FLOW FIELD
   ========================================================= */

function flowAngle(
  x,
  y,
  time,
  seed
) {

  const a =
    Math.sin(
      x * 0.002 +
      time * 0.00025 +
      seed
    );

  const b =
    Math.cos(
      y * 0.0015 -
      time * 0.00022 +
      seed * 1.4
    );

  const c =
    Math.sin(
      (x + y) * 0.001 +
      time * 0.00018
    );

  return (
    a * 2.1 +
    b * 1.7 +
    c * 1.2
  );
}


/* =========================================================
   UPDATE BACKGROUND PARTICLES
   ========================================================= */

function updateParticles(
  time,
  delta
) {

  const dt =
    Math.min(delta, 32);


  for (const p of particles) {

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


    /*
     * Daha güçlü sürekli akış
     */

    p.vx =
      lerp(
        p.vx,
        flowX * 0.12,
        0.035
      );

    p.vy =
      lerp(
        p.vy,
        flowY * 0.12,
        0.035
      );


    /*
     * Mouse alanı
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
          0.045;

        p.vy +=
          (dy / distance) *
          force *
          0.045;


        p.vx +=
          pointer.vx *
          influence *
          0.003;

        p.vy +=
          pointer.vy *
          influence *
          0.003;
      }
    }


    /*
     * Hareket
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
     * Hafif frenleme
     */

    p.vx *= 0.995;
    p.vy *= 0.995;


    /*
     * BOYUT DEĞİŞİMİ
     */

    const pulse =
      Math.sin(
        time *
        p.pulseSpeed +
        p.phase
      );


    const secondPulse =
      Math.sin(
        time *
        p.pulseSpeed *
        0.47 +
        p.seed
      );


    p.size =
      p.baseSize *
      (
        1 +
        pulse * 0.38 +
        secondPulse * 0.16
      );


    /*
     * Ekrandan çıkınca diğer taraftan gir.
     */

    const margin = 50;


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
   UPDATE INFORMATION PIXELS
   ========================================================= */

function updateNodes(time) {

  nodes.forEach((node, index) => {

    const n =
      node.data;


    /*
     * Her bilgi pikselinin kendine ait
     * yörüngesi var.
     */

    const speed =
      0.00045 +
      index * 0.000035;


    const xWave =
      Math.sin(
        time * speed +
        node.phaseX
      );


    const yWave =
      Math.cos(
        time * speed * 0.83 +
        node.phaseY
      );


    /*
     * Ana hareket
     */

    let x =
      xWave *
      node.driftX;


    let y =
      yWave *
      node.driftY;


    /*
     * İkinci küçük akış
     */

    x +=
      Math.sin(
        time * speed * 1.7 +
        node.phaseY
      ) *
      10;

    y +=
      Math.cos(
        time * speed * 1.35 +
        node.phaseX
      ) *
      8;


    /*
     * Mouse bilgi piksellerini de etkiliyor.
     */

    if (pointer.active) {

      const baseX =
        (n.x / 100) * W;

      const baseY =
        (n.y / 100) * H;

      const currentX =
        baseX + x;

      const currentY =
        baseY + y;


      const dx =
        currentX -
        pointer.x;

      const dy =
        currentY -
        pointer.y;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance > 0 &&
        distance < 300
      ) {

        const influence =
          1 -
          distance / 300;


        x +=
          (dx / distance) *
          influence *
          32;

        y +=
          (dy / distance) *
          influence *
          32;
      }
    }


    /*
     * Pikselin boyutu da nefes alıyor.
     */

    const scalePulse =
      1 +
      Math.sin(
        time * node.sizeSpeed +
        node.sizePhase
      ) *
      0.14;


    /*
     * CSS'e aktar
     */

    node.element.style.transform =
      `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
      scale(${scalePulse})
      `;


    /*
     * Hafif parlaklık değişimi
     */

    node.element.style.filter =
      `
      brightness(
        ${0.92 +
        Math.sin(
          time * node.sizeSpeed +
          node.phaseX
        ) * 0.08}
      )
      `;
  });
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground() {

  const gradient =
    ctx.createRadialGradient(
      W * 0.5,
      H * 0.48,
      0,
      W * 0.5,
      H * 0.48,
      Math.max(W, H) * 0.9
    );


  gradient.addColorStop(
    0,
    "#1b1b1b"
  );

  gradient.addColorStop(
    0.35,
    "#101010"
  );

  gradient.addColorStop(
    0.7,
    "#050505"
  );

  gradient.addColorStop(
    1,
    "#000"
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
   DRAW PARTICLES
   ========================================================= */

function drawParticles(time) {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  for (const p of particles) {

    const flicker =
      0.62 +
      Math.sin(
        time *
        p.pulseSpeed *
        2 +
        p.phase
      ) *
      0.38;


    const alpha =
      clamp(
        p.alpha * flicker,
        0.05,
        1
      );


    const brightness =
      Math.floor(
        55 +
        p.brightness * 200
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
        1,
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
   VERY STRONG STATIC
   ========================================================= */

function drawStatic(time) {

  /*
   * Çok daha fazla karıncalanma.
   */

  const amount =
    Math.floor(
      W *
      H *
      0.00125 *
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
      Math.random() * W;

    const y =
      Math.random() * H;


    const randomValue =
      Math.random();


    let value;


    if (randomValue > 0.82) {

      value =
        255;

    } else if (randomValue > 0.35) {

      value =
        random(
          120,
          220
        );

    } else {

      value =
        random(
          10,
          80
        );
    }


    ctx.fillStyle =
      `rgba(
        ${value},
        ${value},
        ${value},
        ${random(.04, .24)}
      )`;


    const size =
      randomValue > .96
        ? random(2, 5)
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
   MOVING NOISE BANDS
   ========================================================= */

function drawNoiseBands(time) {

  ctx.save();

  ctx.globalCompositeOperation =
    "screen";


  /*
   * Sürekli hareket eden yatay
   * bozukluklar.
   */

  const bandCount =
    Math.floor(
      H / 7
    );


  for (
    let i = 0;
    i < bandCount;
    i++
  ) {

    if (
      Math.random() > 0.38
    ) {
      continue;
    }


    const y =
      Math.random() * H;


    const width =
      random(
        W * 0.03,
        W * 0.7
      );


    const x =
      random(
        0,
        W - width
      );


    const alpha =
      random(
        0.03,
        0.20
      );


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
      random(1, 3)
    );
  }


  ctx.restore();
}


/* =========================================================
   BIG GLITCH
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
      2,
      10
    );


  const shift =
    random(
      -70,
      70
    );


  ctx.save();

  ctx.globalAlpha =
    random(
      .08,
      .32
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
   ANIMATION LOOP
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


  updateNodes(
    time
  );


  drawBackground();

  drawParticles(time);

  drawStatic(time);

  drawNoiseBands(time);

  drawGlitch();


  /*
   * FPS kontrolü.
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
      fps < 40 &&
      particles.length >
      CONFIG.minParticles
    ) {

      particles.splice(
        0,
        Math.floor(
          particles.length * 0.05
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
      x - pointer.x;

    pointer.vy =
      y - pointer.y;
  }


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
   BUILD INFORMATION NODES
   ========================================================= */

function buildNodes() {

  nodeLayer.innerHTML =
    "";

  nodes = [];


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


      /*
       * Her bilgi pikseli artık
       * bağımsız hareket ediyor.
       */

      nodes.push({

        element: button,

        data: section,

        phaseX:
          random(
            0,
            Math.PI * 2
          ),

        phaseY:
          random(
            0,
            Math.PI * 2
          ),

        sizePhase:
          random(
            0,
            Math.PI * 2
          ),

        sizeSpeed:
          random(
            0.0011,
            0.0025
          ),

        driftX:
          random(
            18,
            48
          ),

        driftY:
          random(
            15,
            40
          )
      });
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


  opened = true;


  const rect =
    button.getBoundingClientRect();


  const pixelX =
    rect.left +
    rect.width / 2;


  const pixelY =
    rect.top +
    rect.height / 2;


  const isMobile =
    window.innerWidth <= 700;


  const popupWidth =
    Math.min(
      620,
      window.innerWidth -
      (isMobile ? 24 : 40)
    );


  const popupHeight =
    Math.min(
      window.innerHeight *
      0.72,
      720
    );


  let left =
    pixelX + 35;


  let top =
    pixelY -
    popupHeight / 2;


  if (
    left +
    popupWidth >
    window.innerWidth -
    12
  ) {

    left =
      pixelX -
      popupWidth -
      35;
  }


  if (
    left < 12
  ) {

    left =
      (
        window.innerWidth -
        popupWidth
      ) / 2;
  }


  if (
    top < 12
  ) {

    top = 12;
  }


  if (
    top +
    popupHeight >
    window.innerHeight -
    12
  ) {

    top =
      window.innerHeight -
      popupHeight -
      12;
  }


  const centerX =
    left +
    popupWidth / 2;


  const centerY =
    top +
    popupHeight / 2;


  /*
   * Popup içerisindeki açılma noktası.
   */

  const originX =
    pixelX -
    left;


  const originY =
    pixelY -
    top;


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


  sectionSurface.className =
    `section-surface ${section.surface}`;


  sectionLabel.textContent =
    section.label;


  sectionContent.innerHTML =
    section.content;


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


  opened = false;
}


closeButton.addEventListener(
  "click",
  closeSection
);


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
