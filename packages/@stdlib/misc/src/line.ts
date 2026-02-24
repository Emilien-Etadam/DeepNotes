import type { Vec2 } from './vec2';

export class Line {
  start: Vec2;
  end: Vec2;

  constructor(start: Vec2, end: Vec2) {
    this.start = start;
    this.end = end;
  }

  length(): number {
    return this.start.dist(this.end);
  }

  lerp(t: number): Vec2 {
    return this.start.lerp(this.end, t);
  }
}
