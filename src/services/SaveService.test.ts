import { describe, it, expect, beforeEach } from 'vitest';
import { SaveService } from './SaveService';

describe('SaveService Progression System', () => {
  beforeEach(() => {
    SaveService.resetProgress();
  });

  it('initializes with level 1 unlocked and 0 stars', () => {
    expect(SaveService.getUnlockedLevel()).toBe(1);
    expect(SaveService.getStarsForLevel(1)).toBe(0);
  });

  it('unlocks subsequent level and stores stars upon completion', () => {
    SaveService.completeLevel(1, 3, 1500);
    expect(SaveService.getUnlockedLevel()).toBe(2);
    expect(SaveService.getStarsForLevel(1)).toBe(3);

    // Retrying with fewer stars does not downgrade
    SaveService.completeLevel(1, 2, 1200);
    expect(SaveService.getStarsForLevel(1)).toBe(3);
  });
});
