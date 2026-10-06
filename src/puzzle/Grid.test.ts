import { describe, it, expect } from 'vitest';
import {
  rotateDirection,
  getOppositeDirection,
  getNeighborPosition,
  isInsideGrid,
  posKey,
  parsePosKey,
} from './Grid';

describe('Grid Systems', () => {
  it('correctly calculates opposite directions', () => {
    expect(getOppositeDirection('up')).toBe('down');
    expect(getOppositeDirection('down')).toBe('up');
    expect(getOppositeDirection('left')).toBe('right');
    expect(getOppositeDirection('right')).toBe('left');
  });

  it('rotates directions clockwise', () => {
    expect(rotateDirection('up', 90)).toBe('right');
    expect(rotateDirection('right', 90)).toBe('down');
    expect(rotateDirection('down', 90)).toBe('left');
    expect(rotateDirection('left', 90)).toBe('up');

    expect(rotateDirection('up', 180)).toBe('down');
    expect(rotateDirection('up', 270)).toBe('left');
    expect(rotateDirection('up', 360)).toBe('up');
  });

  it('computes adjacent neighbor positions', () => {
    const origin = { x: 2, y: 2 };
    expect(getNeighborPosition(origin, 'up')).toEqual({ x: 2, y: 1 });
    expect(getNeighborPosition(origin, 'down')).toEqual({ x: 2, y: 3 });
    expect(getNeighborPosition(origin, 'left')).toEqual({ x: 1, y: 2 });
    expect(getNeighborPosition(origin, 'right')).toEqual({ x: 3, y: 2 });
  });

  it('validates boundaries', () => {
    expect(isInsideGrid({ x: 0, y: 0 }, 5, 5)).toBe(true);
    expect(isInsideGrid({ x: 4, y: 4 }, 5, 5)).toBe(true);
    expect(isInsideGrid({ x: -1, y: 2 }, 5, 5)).toBe(false);
    expect(isInsideGrid({ x: 5, y: 2 }, 5, 5)).toBe(false);
    expect(isInsideGrid({ x: 2, y: 5 }, 5, 5)).toBe(false);
  });

  it('converts position to key and back', () => {
    const pos = { x: 3, y: 7 };
    const key = posKey(pos);
    expect(key).toBe('3,7');
    expect(parsePosKey(key)).toEqual(pos);
  });
});
