export type Direction = 'up' | 'right' | 'down' | 'left';

export const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];

export interface GridPosition {
  x: number; // column index 0..width-1
  y: number; // row index 0..height-1
}

export function arePositionsEqual(a: GridPosition, b: GridPosition): boolean {
  return a.x === b.x && a.y === b.y;
}

export function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}

export function getDirectionDelta(dir: Direction): GridPosition {
  switch (dir) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

export function getNeighborPosition(pos: GridPosition, dir: Direction): GridPosition {
  const delta = getDirectionDelta(dir);
  return { x: pos.x + delta.x, y: pos.y + delta.y };
}

/**
 * Rotates a direction clockwise by (rotationDegrees / 90) steps.
 */
export function rotateDirection(dir: Direction, rotationDegrees: number): Direction {
  const steps = ((Math.round(rotationDegrees / 90) % 4) + 4) % 4;
  const index = DIRECTIONS.indexOf(dir);
  return DIRECTIONS[(index + steps) % 4];
}

export function isInsideGrid(pos: GridPosition, width: number, height: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
}

export function posKey(pos: GridPosition): string {
  return `${pos.x},${pos.y}`;
}

export function parsePosKey(key: string): GridPosition {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}
