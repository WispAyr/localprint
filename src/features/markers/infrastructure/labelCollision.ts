/**
 * Label collision detection for marker labels.
 * Used by both the preview overlay (CSS offsets) and the export renderer (canvas).
 */

export interface LabelRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LabelPlacement {
  dx: number;
  dy: number;
}

interface MarkerLabelInput {
  cx: number; // marker center x
  cy: number; // marker center y
  iconSize: number;
  titleLength: number;
  hasSubline: boolean;
}

const CHAR_WIDTH = 6; // approximate px per char at ~10px font
const LINE_HEIGHT = 14;
const SUB_LINE_HEIGHT = 11;
const LABEL_PAD = 4;

function estimateLabelSize(titleLength: number, hasSubline: boolean): { w: number; h: number } {
  const w = Math.max(30, titleLength * CHAR_WIDTH + LABEL_PAD * 2);
  const h = LINE_HEIGHT + (hasSubline ? SUB_LINE_HEIGHT : 0) + LABEL_PAD;
  return { w, h };
}

type PositionFn = (cx: number, cy: number, iconHalf: number, lw: number, lh: number) => { dx: number; dy: number };

const POSITIONS: PositionFn[] = [
  // Right (default)
  (_cx, _cy, iconHalf, _lw, lh) => ({ dx: iconHalf + 4, dy: -lh / 2 }),
  // Left
  (_cx, _cy, iconHalf, lw, lh) => ({ dx: -(iconHalf + lw + 4), dy: -lh / 2 }),
  // Above
  (_cx, _cy, iconHalf, lw, lh) => ({ dx: -lw / 2, dy: -(iconHalf + lh + 2) }),
  // Below
  (_cx, _cy, iconHalf, lw, _lh) => ({ dx: -lw / 2, dy: iconHalf + 2 }),
  // Right-offset-up
  (_cx, _cy, iconHalf, _lw, lh) => ({ dx: iconHalf + 4, dy: -lh - 4 }),
  // Right-offset-down
  (_cx, _cy, iconHalf, _lw, _lh) => ({ dx: iconHalf + 4, dy: 4 }),
];

function rectsOverlap(a: LabelRect, b: LabelRect): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

function overlapArea(a: LabelRect, b: LabelRect): number {
  const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return ox * oy;
}

export function resolveLabels(inputs: MarkerLabelInput[]): LabelPlacement[] {
  const placed: LabelRect[] = [];
  const results: LabelPlacement[] = [];

  for (const input of inputs) {
    const { w, h } = estimateLabelSize(input.titleLength, input.hasSubline);
    const iconHalf = input.iconSize / 2;

    let bestPos = POSITIONS[0](input.cx, input.cy, iconHalf, w, h);
    let bestOverlap = Infinity;

    for (const posFn of POSITIONS) {
      const pos = posFn(input.cx, input.cy, iconHalf, w, h);
      const rect: LabelRect = { x: input.cx + pos.dx, y: input.cy + pos.dy, w, h };

      let totalOverlap = 0;
      for (const p of placed) {
        if (rectsOverlap(rect, p)) {
          totalOverlap += overlapArea(rect, p);
        }
      }

      if (totalOverlap < bestOverlap) {
        bestOverlap = totalOverlap;
        bestPos = pos;
        if (totalOverlap === 0) break;
      }
    }

    const finalRect: LabelRect = { x: input.cx + bestPos.dx, y: input.cy + bestPos.dy, w, h };
    placed.push(finalRect);
    results.push(bestPos);
  }

  return results;
}

/**
 * Canvas-specific version with scaled dimensions.
 */
export function resolveLabelsCanvas(
  inputs: { cx: number; cy: number; iconSize: number; titleLength: number; hasSubline: boolean }[],
  scale: number,
): LabelPlacement[] {
  // Scale char width and line heights for canvas resolution
  const scaled = inputs.map(i => ({
    ...i,
    titleLength: i.titleLength, // keep char count, we'll scale the result
  }));
  const placements = resolveLabels(scaled);
  return placements.map(p => ({ dx: p.dx * scale, dy: p.dy * scale }));
}
