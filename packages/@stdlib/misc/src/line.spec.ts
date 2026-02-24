import { Line } from './line';
import { Vec2 } from './vec2';

describe('Line', () => {
  it('construction avec deux Vec2', () => {
    const start = new Vec2(0, 0);
    const end = new Vec2(10, 0);
    const line = new Line(start, end);
    expect(line.start).toBe(start);
    expect(line.end).toBe(end);
  });

  it('length() retourne la bonne longueur', () => {
    const line = new Line(new Vec2(0, 0), new Vec2(3, 4));
    expect(line.length()).toBe(5);
  });

  it('lerp(0.5) retourne le point milieu', () => {
    const line = new Line(new Vec2(0, 0), new Vec2(10, 20));
    const mid = line.lerp(0.5);
    expect(mid.x).toBe(5);
    expect(mid.y).toBe(10);
  });

  it('cas ligne de longueur 0', () => {
    const p = new Vec2(1, 2);
    const line = new Line(p, p);
    expect(line.length()).toBe(0);
    const mid = line.lerp(0.5);
    expect(mid.x).toBe(1);
    expect(mid.y).toBe(2);
  });
});
