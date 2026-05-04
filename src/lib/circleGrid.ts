/**
 * Circle-grid utilities — Preloader · HomeHero · DesignPage
 *
 * Spec (fixed, never scaled):
 *   Dot diameter : 7 px  (radius 3.5 px)
 *   Gap          : 0.7 px (1/10 of diameter)
 *   Stride       : 7.7 px (center-to-center, same in X and Y → always square)
 *
 * Columns/rows are computed from viewport at runtime so every device is covered.
 */

export const STRIDE       = 7.7;   // center-to-center spacing (px)
export const DOT_R        = 3.5;   // circle radius (px) — never changes
export const CIRCLE_COLOR = "#DDE7EF";

// ─── Alpha tiers ──────────────────────────────────────────────────────────────
const THRESHOLD = 0.36;
const N_MID     = 0.50;
const N_MID1    = 0.52;
const N_MID2    = 0.54;
const N_MID3    = 0.56;
const N_CORE    = 0.58;

const A_MID1 = 0.20;
const A_MID2 = 0.40;
const A_MID3 = 0.60;
const A_MID4 = 0.80;
const A_CORE = 1.00;

function cellAlpha(n: number): number {
  if (n <= THRESHOLD) return 0;
  if (n <  N_MID)     return 0;      // A_EDGE — fully transparent
  if (n <  N_MID1)    return A_MID1;
  if (n <  N_MID2)    return A_MID2;
  if (n <  N_MID3)    return A_MID3;
  if (n <  N_CORE)    return A_MID4;
  return A_CORE;
}

// ─── Value noise (quintic interpolation) ─────────────────────────────────────
function h(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function q(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function vn(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const u  = q(x - ix),    v  = q(y - iy);
  const a  = h(ix,   iy),  b  = h(ix + 1, iy);
  const c  = h(ix,   iy + 1), d = h(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// 4-octave fBm
export function fbm(x: number, y: number): number {
  return (
    vn(x, y)         * 0.5000 +
    vn(x * 2, y * 2) * 0.2500 +
    vn(x * 4, y * 4) * 0.1250 +
    vn(x * 8, y * 8) * 0.0625
  ) / 0.9375;
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
/** Number of dot columns needed to cover canvas width W */
export function gridCols(W: number): number { return Math.ceil(W / STRIDE) + 1; }
/** Number of dot rows    needed to cover canvas height H */
export function gridRows(H: number): number { return Math.ceil(H / STRIDE) + 1; }

// Noise sampling: normalised by 1920×1080 reference so pattern density is
// consistent across all screen sizes.
function nx(col: number, offX: number): number {
  return col * STRIDE / 1920 * 4.5 + offX;
}
function ny(row: number, offY: number): number {
  return row * STRIDE / 1080 * 3.2 + offY;
}

// ─── Batch draw (5 alpha tiers, DOT_R is constant) ───────────────────────────
type Circ = { cx: number; cy: number };

function batchDraw(
  ctx:  CanvasRenderingContext2D,
  t020: Circ[], t040: Circ[], t060: Circ[],
  t080: Circ[], t100: Circ[],
): void {
  ctx.fillStyle = CIRCLE_COLOR;
  const tiers: [number, Circ[]][] = [
    [0.20, t020], [0.40, t040], [0.60, t060], [0.80, t080], [1.00, t100],
  ];
  for (const [alpha, batch] of tiers) {
    if (!batch.length) continue;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (const { cx, cy } of batch) {
      ctx.moveTo(cx + DOT_R, cy);
      ctx.arc(cx, cy, DOT_R, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Trail types (cursor dispersion) ─────────────────────────────────────────
export type TrailPoint = { x: number; y: number; t: number };
export const TRAIL_MS   = 850;

// ─── HomeHero / DesignPage frame ─────────────────────────────────────────────
/**
 * Draws the animated cloud dot background.
 * Cursor DISPERSES dots — they fade out near the trail path.
 */
export function drawFrame(
  ctx:     CanvasRenderingContext2D,
  W:       number,
  H:       number,
  offsetX: number,
  offsetY: number,
  trail:   TrailPoint[],
  now:     number,
): void {
  ctx.clearRect(0, 0, W, H);

  const COLS   = gridCols(W);
  const ROWS   = gridRows(H);
  const SIGMA  = 90;
  const SIGMA2 = SIGMA * SIGMA;
  const MAX_R2 = SIGMA2 * 12;

  const t020: Circ[] = [], t040: Circ[] = [], t060: Circ[] = [],
        t080: Circ[] = [], t100: Circ[] = [];

  for (let row = 0; row < ROWS; row++) {
    const cy = (row + 0.5) * STRIDE;
    if (cy > H + DOT_R) break;

    for (let col = 0; col < COLS; col++) {
      const cx = (col + 0.5) * STRIDE;
      if (cx > W + DOT_R) break;

      const n = fbm(nx(col, offsetX), ny(row, offsetY));
      let a   = cellAlpha(n);
      if (a === 0) continue;

      // Cursor dispersion: fade alpha near trail
      for (const tp of trail) {
        const age = (now - tp.t) / TRAIL_MS;
        if (age >= 1) continue;
        const dx = cx - tp.x, dy = cy - tp.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > MAX_R2) continue;
        const disp = Math.exp(-d2 / SIGMA2) * Math.pow(1 - age, 1.5);
        a = Math.max(0, a - disp * a);
      }
      if (a < 0.02) continue;

      if      (a <= 0.30) t020.push({ cx, cy });
      else if (a <= 0.50) t040.push({ cx, cy });
      else if (a <= 0.70) t060.push({ cx, cy });
      else if (a <= 0.90) t080.push({ cx, cy });
      else                t100.push({ cx, cy });
    }
  }

  batchDraw(ctx, t020, t040, t060, t080, t100);
}

// ─── Preloader — organic edge variation ──────────────────────────────────────
/**
 * Pre-compute per-cell organic edge offsets (one-time per canvas size).
 * The cloud "front" bulges in organic blob shapes instead of a straight line.
 */
export type EdgeVariation = { arr: Float32Array; cols: number };

export function computeEdgeVariation(W: number, H: number): EdgeVariation {
  const COLS = gridCols(W);
  const ROWS = gridRows(H);
  const arr  = new Float32Array(COLS * ROWS);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // Coarse smooth noise — creates large polygon-like cloud front blobs
      const noise = vn(
        col * STRIDE / 1920 * 1.3 + 8.73,
        row * STRIDE / 1080 * 0.85 + 3.17,
      );
      // ±22% of screen width variation
      arr[row * COLS + col] = (noise - 0.5) * 0.44;
    }
  }
  return { arr, cols: COLS };
}

// ─── Preloader frame ─────────────────────────────────────────────────────────
/**
 * Draws the preloader dot field.
 *
 * Phases:
 *   progress 0→1  : cloud shapes scroll in from the left as whole polygons
 *   logoHole  0→1 : transparent hole grows around logo center
 *
 * Initial state (progress=0): all dots solid alpha=1.
 * Final state   (progress=1): natural cloud pattern (matches HomeHero t=0).
 */
export function drawPreloaderFrame(
  ctx:      CanvasRenderingContext2D,
  W:        number,
  H:        number,
  offsetX:  number,
  offsetY:  number,
  progress: number,    // 0..1
  logoCX:   number,
  logoCY:   number,
  logoHole: number,    // 0..1
  ev:       EdgeVariation,
): void {
  ctx.clearRect(0, 0, W, H);

  const COLS = gridCols(W);
  const ROWS = gridRows(H);
  const SOFT = 0.05;

  // Cloud pattern scrolls in from the LEFT:
  //   at progress=0 → sweepOff = -4.0 (clouds far off-screen left)
  //   at progress=1 → sweepOff =  0.0 (natural / matches HomeHero initial)
  // ease-out so clouds decelerate into final position
  const eased    = 1 - Math.pow(1 - progress, 2);
  const sweepOff = -4.0 * (1 - eased);
  const cloudX   = sweepOff + offsetX;

  // Logo hole
  const HOLE_R    = Math.max(W, H) * 0.17 * logoHole;
  const HOLE_SOFT = HOLE_R * 0.5;

  const t020: Circ[] = [], t040: Circ[] = [], t060: Circ[] = [],
        t080: Circ[] = [], t100: Circ[] = [];

  for (let row = 0; row < ROWS; row++) {
    const cy = (row + 0.5) * STRIDE;
    if (cy > H + DOT_R) break;

    for (let col = 0; col < COLS; col++) {
      const cx = (col + 0.5) * STRIDE;
      if (cx > W + DOT_R) break;

      // Organic threshold: each cell has its own "arrival time"
      // based on smooth large-scale noise → cloud-shaped leading edge
      const edgeOff      = ev.arr[row * ev.cols + col] ?? 0;
      const normX        = cx / W;
      const effectiveNX  = normX - edgeOff;
      const zoneT        = Math.max(0, Math.min(1, (progress - effectiveNX) / SOFT));

      let alpha: number;
      if (zoneT <= 0) {
        // Solid zone — no fbm needed (big performance win)
        alpha = 1.0;
      } else {
        // Cloud / transition zone
        const n  = fbm(nx(col, cloudX), ny(row, offsetY));
        const ca = cellAlpha(n);
        alpha    = zoneT >= 1 ? ca : 1.0 + (ca - 1.0) * zoneT;
      }

      // Logo hole: fade out dots near logo center
      if (logoHole > 0 && HOLE_R > 0) {
        const dx   = cx - logoCX;
        const dy   = cy - logoCY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < HOLE_R) {
          const holeT = Math.max(0, Math.min(1,
            1 - (dist - HOLE_SOFT) / Math.max(1, HOLE_R - HOLE_SOFT),
          ));
          alpha *= (1 - holeT);
        }
      }

      if (alpha < 0.05) continue;

      if      (alpha <= 0.30) t020.push({ cx, cy });
      else if (alpha <= 0.50) t040.push({ cx, cy });
      else if (alpha <= 0.70) t060.push({ cx, cy });
      else if (alpha <= 0.90) t080.push({ cx, cy });
      else                    t100.push({ cx, cy });
    }
  }

  batchDraw(ctx, t020, t040, t060, t080, t100);
}
