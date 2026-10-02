# Pixel Portfolio

Experimental black/white/CRT portfolio prototype.

## Run

No build step is required for this prototype.

Open `index.html` in a browser.

For local development, a simple static server is recommended, e.g.:

`python -m http.server 8000`

Then open:

`http://localhost:8000`

## Main files

- `index.html` — page structure
- `styles.css` — CRT / pixel visual system
- `app.js` — animated pixel field, mouse interaction and section transitions

## Main visual parameters

At the top of `app.js`, edit `CONFIG`:

- `pixelCount`
- `minPixel`
- `maxPixel`
- `density`
- `noiseScale`
- `noiseSpeed`
- `flickerAmount`
- `flickerSpeed`
- `mouseInfluence`
- `grainAmount`

## Add or edit sections

The `sections` array in `app.js` controls the portfolio nodes and their content.

Each section can define:

- `label`
- `x`, `y`
- `size`
- `color`
- `surface`
- `content`

The current prototype includes About Me, Works, Education, Experience, Contact and CV.

Replace placeholder links and text with the real portfolio content.
