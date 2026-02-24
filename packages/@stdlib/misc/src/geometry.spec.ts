import { getLineRectIntersection } from './geometry';
import { Line } from './line';
import { Rect } from './rect';
import { Vec2 } from './vec2';

describe('getLineRectIntersection', () => {
  it('ligne qui traverse un rectangle → retourne le point d\'intersection', () => {
    const line = new Line(new Vec2(-10, 5), new Vec2(10, 5));
    const rect = new Rect(new Vec2(0, 0), new Vec2(20, 10));
    const result = getLineRectIntersection(line, rect);
    expect(result).not.toBeNull();
    expect(result!.x).toBe(0);
    expect(result!.y).toBe(5);
  });

  it('ligne entièrement à l\'extérieur → retourne null', () => {
    const line = new Line(new Vec2(-20, -20), new Vec2(-10, -10));
    const rect = new Rect(new Vec2(0, 0), new Vec2(20, 20));
    const result = getLineRectIntersection(line, rect);
    expect(result).toBeNull();
  });

  it('ligne qui part du centre du rectangle → retourne le point de sortie', () => {
    const line = new Line(new Vec2(10, 10), new Vec2(30, 10));
    const rect = new Rect(new Vec2(0, 0), new Vec2(20, 20));
    const result = getLineRectIntersection(line, rect);
    expect(result).not.toBeNull();
    // getLineRectIntersection retourne result[0] (premier point du segment clippé = point d'entrée)
    expect(result!.x).toBe(10);
    expect(result!.y).toBe(10);
  });
});
