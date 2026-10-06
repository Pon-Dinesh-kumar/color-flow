import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { EnvironmentManager } from './Environment';
import { TargetCanisterMesh } from './TargetCanisterMesh';

describe('shared target floor', () => {
  it.each([1, 2, 8])('supports %i target glasses on one surface', (targetCount) => {
    const scene = new THREE.Scene();
    const environment = new EnvironmentManager(scene);
    const target = {
      id: 'target',
      position: { x: 0, y: 0 },
      acceptDirection: 'up' as const,
      color: 'red' as const,
      requiredAmount: 10,
      currentAmount: 0,
    };
    const glass = new TargetCanisterMesh(target);
    glass.group.position.y = -2;
    const bounds = {
      minX: -((targetCount - 1) * 1.6) / 2 - 0.8,
      maxX: ((targetCount - 1) * 1.6) / 2 + 0.8,
      minY: glass.getBottomY(),
      maxY: 2,
    };

    const frameBounds = environment.updatePlatform(bounds, targetCount);
    const podium = scene.getObjectByName('podium_platform')!;
    const deck = podium.getObjectByName('podium_deck') as THREE.Mesh;
    deck.geometry.computeBoundingBox();

    expect(deck.position.y + deck.geometry.boundingBox!.max.y).toBeCloseTo(glass.getBottomY());
    expect(frameBounds.minX).toBeLessThanOrEqual(bounds.minX);
    expect(frameBounds.maxX).toBeGreaterThanOrEqual(bounds.maxX);
    expect(frameBounds.minY).toBeLessThan(glass.getBottomY());
  });
});
