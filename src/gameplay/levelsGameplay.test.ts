import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/AnalyticsService', () => ({
  AnalyticsService: { track: vi.fn() },
}));

import { LEVELS } from '../data/levels/levelsData';
import { useGameStore } from '../game/gameState';
import { LevelValidator } from './LevelValidator';
import { AnalyticsService } from '../services/AnalyticsService';
import {
  CompletionRoute,
  deliveryPlan,
  findCompletionRoute,
  movesForStars,
  playCompletionRoute,
  rotatePipeAction,
  toggleGateAction,
} from './levelGameplayTestHarness';

const CATALOG_LEVELS = LEVELS.filter((level) => level.number >= 1 && level.number <= 30);
const routeCache = new Map<number, CompletionRoute | null>();

function routeFor(levelNumber: number): CompletionRoute | null {
  if (!routeCache.has(levelNumber)) {
    const level = CATALOG_LEVELS.find((candidate) => candidate.number === levelNumber)!;
    routeCache.set(levelNumber, findCompletionRoute(level));
  }
  return routeCache.get(levelNumber)!;
}

function deliverEveryTarget(levelNumber: number, route: CompletionRoute, moveThreshold: number) {
  const level = CATALOG_LEVELS.find((candidate) => candidate.number === levelNumber)!;
  const result = playCompletionRoute(level, route, moveThreshold);
  expect(result.connectedTargetIds).toHaveLength(level.targets.length);

  const plan = deliveryPlan(level, result);
  const sourceTotal = level.sources.reduce((sum, source) => sum + source.amount, 0);
  expect(plan).toHaveLength(level.targets.reduce((sum, target) => sum + target.requiredAmount, 0));
  expect(plan.length).toBeLessThanOrEqual(sourceTotal);

  for (const delivery of plan) useGameStore.getState().deliverBall(delivery.targetId, delivery.color);
  const state = useGameStore.getState();
  expect(state.phase).toBe('completed');
  for (const target of level.targets) {
    expect(state.targets[target.id].current).toBe(target.requiredAmount);
    expect(state.targets[target.id].isComplete).toBe(true);
  }
  return state;
}

describe('automated gameplay scenarios for levels 1–30', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('covers exactly the 30 catalog levels', () => {
    expect(CATALOG_LEVELS.map((level) => level.number)).toEqual(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );
  });

  describe.each(CATALOG_LEVELS)('level $number: $title', (level) => {
    const route = routeFor(level.number);

    it('has a structurally valid board layout', () => {
      const validation = LevelValidator.validate(level);
      expect(validation.errors, validation.errors.join('; ')).toEqual([]);
    });

    it('completes all targets for 3 stars using legal route moves', () => {
      expect(route, `Level ${level.number} has no legal all-target completion route`).not.toBeNull();
      const moves = movesForStars(level, route!, 3);
      expect(moves, `Level ${level.number} has no route with a 3-star move count`).not.toBeNull();
      const completed = deliverEveryTarget(level.number, route!, moves!);
      expect(completed.starsEarned).toBe(3);
    });

    it('completes all targets for 2 stars using legal route moves', () => {
      expect(route, `Level ${level.number} has no legal all-target completion route`).not.toBeNull();
      const moves = movesForStars(level, route!, 2);
      expect(moves, `Level ${level.number} has no legal route in the 2-star move band`).not.toBeNull();
      const completed = deliverEveryTarget(level.number, route!, moves!);
      expect(completed.starsEarned).toBe(2);
    });

    it('completes all targets for 1 star using legal route moves', () => {
      expect(route, `Level ${level.number} has no legal all-target completion route`).not.toBeNull();
      const moves = movesForStars(level, route!, 1);
      expect(moves, `Level ${level.number} has no legal route in the 1-star move band`).not.toBeNull();
      const completed = deliverEveryTarget(level.number, route!, moves!);
      expect(completed.starsEarned).toBe(1);
    });

    it('fails after exhausting the legal move limit and records analytics', () => {
      useGameStore.getState().loadLevel(level.number);
      const maxMoves = level.maxMoves ?? 12;
      const movablePipe = level.pipes.find(rotatePipeAction);
      const gate = level.pipes.find(toggleGateAction);
      const legalAction = movablePipe
        ? () => useGameStore.getState().rotatePipe(movablePipe.id)
        : gate
          ? () => useGameStore.getState().toggleGate(gate.id)
          : null;
      expect(legalAction, `Level ${level.number} has no legal pipe or gate interaction`).not.toBeNull();

      for (let move = 0; move < maxMoves; move += 1) legalAction!();
      expect(useGameStore.getState().movesUsed).toBe(maxMoves);
      expect(useGameStore.getState().phase).toBe('playing');

      legalAction!();

      expect(useGameStore.getState().movesUsed).toBe(maxMoves);
      expect(useGameStore.getState().phase).toBe('failed');
      expect(AnalyticsService.track).toHaveBeenCalledWith('level_failed', {
        levelNumber: level.number,
        movesUsed: maxMoves,
        reason: 'out_of_moves',
      });
      const analyticsTrack = vi.mocked(AnalyticsService.track);
      expect(analyticsTrack.mock.calls.filter(([event]) => event === 'level_failed')).toHaveLength(1);
    });
  });
});
