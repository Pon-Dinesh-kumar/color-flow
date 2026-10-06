import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/AnalyticsService', () => ({
  AnalyticsService: { track: vi.fn() },
}));

import { useGameStore } from './gameState';
import { AnalyticsService } from '../services/AnalyticsService';

function getCurrentLevelMoveLimit(): number {
  const maxMoves = useGameStore.getState().currentLevel?.maxMoves;
  if (maxMoves === undefined) {
    throw new Error('The loaded test level must define a move limit.');
  }
  return maxMoves;
}

describe('game move limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.getState().loadLevel(2);
  });

  it('allows the last permitted move and fails on the next valid move', () => {
    const { rotatePipe } = useGameStore.getState();
    const maxMoves = getCurrentLevelMoveLimit();

    for (let move = 0; move < maxMoves; move += 1) {
      rotatePipe('p1');
    }

    expect(useGameStore.getState().movesUsed).toBe(maxMoves);
    expect(useGameStore.getState().phase).toBe('playing');

    rotatePipe('p1');

    expect(useGameStore.getState().movesUsed).toBe(maxMoves);
    expect(useGameStore.getState().phase).toBe('failed');
    expect(AnalyticsService.track).toHaveBeenCalledWith('level_failed', {
      levelNumber: 2,
      movesUsed: maxMoves,
      reason: 'out_of_moves',
    });
  });

  it('does not fail for a locked pipe at the move limit', () => {
    const { rotatePipe } = useGameStore.getState();
    const maxMoves = getCurrentLevelMoveLimit();

    for (let move = 0; move < maxMoves; move += 1) {
      rotatePipe('p1');
    }

    rotatePipe('p2');

    expect(useGameStore.getState().phase).toBe('playing');
    expect(useGameStore.getState().movesUsed).toBe(maxMoves);
    expect(AnalyticsService.track).not.toHaveBeenCalledWith(
      'level_failed',
      expect.anything(),
    );
  });

  it('enforces the move limit when toggling a gate', () => {
    useGameStore.getState().loadLevel(10);
    const { toggleGate } = useGameStore.getState();
    const maxMoves = getCurrentLevelMoveLimit();

    for (let move = 0; move < maxMoves; move += 1) {
      toggleGate('g1');
    }

    expect(useGameStore.getState().movesUsed).toBe(maxMoves);
    expect(useGameStore.getState().phase).toBe('playing');

    toggleGate('g1');

    expect(useGameStore.getState().movesUsed).toBe(maxMoves);
    expect(useGameStore.getState().phase).toBe('failed');
    expect(AnalyticsService.track).toHaveBeenCalledWith('level_failed', {
      levelNumber: 10,
      movesUsed: maxMoves,
      reason: 'out_of_moves',
    });
  });
});
