import { describe, it, expect } from 'vitest';
import { LevelValidator } from './LevelValidator';
import { LevelConfig } from './Level';
import { LEVELS } from '../data/levels/levelsData';

describe('Level Validation System', () => {
  it('validates handcrafted tutorial levels successfully', () => {
    const level1 = LEVELS[0];
    const result = LevelValidator.validate(level1);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('detects invalid out-of-bounds positions', () => {
    const badLevel: LevelConfig = {
      id: 'bad_lvl',
      number: 99,
      title: 'Bad Level',
      grid: { width: 3, height: 3 },
      sources: [{ id: 's1', position: { x: 5, y: 0 }, direction: 'down', color: 'red', amount: 10 }],
      targets: [{ id: 't1', position: { x: 0, y: 2 }, acceptDirection: 'up', color: 'red', requiredAmount: 10, currentAmount: 0 }],
      pipes: [],
    };

    const result = LevelValidator.validate(badLevel);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('outside grid'))).toBe(true);
  });

  it('detects missing sources or targets', () => {
    const emptyLevel: LevelConfig = {
      id: 'empty_lvl',
      number: 98,
      title: 'Empty Level',
      grid: { width: 4, height: 4 },
      sources: [],
      targets: [],
      pipes: [],
    };

    const result = LevelValidator.validate(emptyLevel);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Level has no sources defined');
    expect(result.errors).toContain('Level has no targets defined');
  });
});
