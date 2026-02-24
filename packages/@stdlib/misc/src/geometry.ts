import type { Line } from './line';
import type { Rect } from './rect';
import { Vec2 } from './vec2';

export function getLineRectIntersection(line: Line, rect: Rect): Vec2 | null {
  const result = liangBarsky(
    line.start,
    line.end,
    rect.topLeft,
    rect.bottomRight,
  );

  if (result == null) {
    return null;
  }

  return result[0];
}

function getEdgeParams(
  edge: number,
  x0: number,
  y0: number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  dx: number,
  dy: number,
): { p: number; q: number } {
  if (edge === 0) {
    return { p: -dx, q: -(xmin - x0) };
  }
  if (edge === 1) {
    return { p: dx, q: xmax - x0 };
  }
  if (edge === 2) {
    return { p: -dy, q: -(ymin - y0) };
  }
  return { p: dy, q: ymax - y0 };
}

function applyLiangBarskyEdge(
  p: number,
  q: number,
  t0: number,
  t1: number,
): { t0: number; t1: number } | null {
  if (p === 0) {
    if (q < 0) return null;
    return { t0, t1 };
  }
  const r = q / p;

  if (p < 0) {
    if (r > t1) return null;
    if (r > t0) return { t0: r, t1 };
    return { t0, t1 };
  }
  if (p > 0) {
    if (r < t0) return null;
    if (r < t1) return { t0, t1: r };
    return { t0, t1 };
  }
  return { t0, t1 };
}

function liangBarsky(l0: Vec2, l1: Vec2, r0: Vec2, r1: Vec2): Vec2[] | null {
  const { x: x0, y: y0 } = l0;
  const { x: x1, y: y1 } = l1;

  const { x: xmin, y: ymin } = r0;
  const { x: xmax, y: ymax } = r1;

  let t0 = 0;
  let t1 = 1;

  const dx = x1 - x0;
  const dy = y1 - y0;

  for (let edge = 0; edge < 4; edge++) {
    const { p, q } = getEdgeParams(
      edge,
      x0,
      y0,
      xmin,
      xmax,
      ymin,
      ymax,
      dx,
      dy,
    );

    const next = applyLiangBarskyEdge(p, q, t0, t1);
    if (next == null) return null;
    t0 = next.t0;
    t1 = next.t1;
  }

  return [
    new Vec2(x0 + t0 * dx, y0 + t0 * dy),
    new Vec2(x0 + t1 * dx, y0 + t1 * dy),
  ];
}
