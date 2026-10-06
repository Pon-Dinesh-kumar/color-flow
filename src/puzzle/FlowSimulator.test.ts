import { describe, it, expect } from 'vitest';
import { FlowSimulator, LevelSimulationState } from './FlowSimulator';
import { PipeNode } from './Pipe';
import { SourceNode } from './Source';
import { TargetNode } from './Target';
import { posKey } from './Grid';

describe('FlowSimulator Deterministic Logic', () => {
  it('connects a straight pipe from source to target', () => {
    // Source at (1, 0) pointing down
    // Pipe at (1, 1) straight rotation 0 (connects up & down)
    // Target at (1, 2) accepting up
    const pipes = new Map<string, PipeNode>();
    pipes.set(
      posKey({ x: 1, y: 1 }),
      {
        id: 'p1',
        type: 'straight',
        gridPosition: { x: 1, y: 1 },
        rotation: 0,
      }
    );

    const sources: SourceNode[] = [
      {
        id: 's1',
        position: { x: 1, y: 0 },
        direction: 'down',
        color: 'red',
        amount: 10,
      },
    ];

    const targets: TargetNode[] = [
      {
        id: 't1',
        position: { x: 1, y: 2 },
        acceptDirection: 'up',
        color: 'red',
        requiredAmount: 10,
        currentAmount: 0,
      },
    ];

    const state: LevelSimulationState = {
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    };

    const result = FlowSimulator.simulate(state);
    expect(result.connectedTargetIds).toContain('t1');
    expect(result.activePipes.has('p1')).toBe(true);
    expect(result.paths.length).toBeGreaterThan(0);
    expect(result.paths[0].reachesTarget).toBe(true);
  });

  it('fails to connect when pipe is rotated 90 degrees (horizontal)', () => {
    const pipes = new Map<string, PipeNode>();
    pipes.set(
      posKey({ x: 1, y: 1 }),
      {
        id: 'p1',
        type: 'straight',
        gridPosition: { x: 1, y: 1 },
        rotation: 90, // now connects left & right
      }
    );

    const sources: SourceNode[] = [
      {
        id: 's1',
        position: { x: 1, y: 0 },
        direction: 'down',
        color: 'blue',
        amount: 10,
      },
    ];

    const targets: TargetNode[] = [
      {
        id: 't1',
        position: { x: 1, y: 2 },
        acceptDirection: 'up',
        color: 'blue',
        requiredAmount: 10,
        currentAmount: 0,
      },
    ];

    const state: LevelSimulationState = {
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    };

    const result = FlowSimulator.simulate(state);
    expect(result.connectedTargetIds).not.toContain('t1');
    expect(result.activePipes.has('p1')).toBe(false);
  });

  it('routes correctly through corners (elbows)', () => {
    // Source at (0, 0) pointing down
    // Corner at (0, 1) rot 270 (connects up & right)
    // Corner at (1, 1) rot 90 (connects left & down)
    // Target at (1, 2) accepting up
    const pipes = new Map<string, PipeNode>();
    // Corner at rot 0 has ports ['up', 'right'].
    // At rot 270: rotateDirection('up', 270) = 'left', rotateDirection('right', 270) = 'up'.
    // Let's check rotation:
    // rot 0: up, right
    // rot 90: right, down
    // rot 180: down, left
    // rot 270: left, up
    // So to enter from 'up' and exit to 'right': base ports are ['up', 'right'], which is rot 0!
    pipes.set(
      posKey({ x: 0, y: 1 }),
      {
        id: 'c1',
        type: 'corner',
        gridPosition: { x: 0, y: 1 },
        rotation: 0, // 'up' and 'right'
      }
    );
    // Next pipe at (1, 1): enters from 'left', exits 'down'.
    // Ports needed: 'left' and 'down'.
    // At rot 180: 'up' -> 'down', 'right' -> 'left'. So rot 180 has ports 'down' and 'left'!
    pipes.set(
      posKey({ x: 1, y: 1 }),
      {
        id: 'c2',
        type: 'corner',
        gridPosition: { x: 1, y: 1 },
        rotation: 180, // 'down' and 'left'
      }
    );

    const sources: SourceNode[] = [
      {
        id: 's1',
        position: { x: 0, y: 0 },
        direction: 'down',
        color: 'yellow',
        amount: 10,
      },
    ];

    const targets: TargetNode[] = [
      {
        id: 't1',
        position: { x: 1, y: 2 },
        acceptDirection: 'up',
        color: 'yellow',
        requiredAmount: 10,
        currentAmount: 0,
      },
    ];

    const result = FlowSimulator.simulate({
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    });

    expect(result.connectedTargetIds).toContain('t1');
    expect(result.activePipes.has('c1')).toBe(true);
    expect(result.activePipes.has('c2')).toBe(true);
  });

  it('transforms color through a ColorChanger pipe', () => {
    const pipes = new Map<string, PipeNode>();
    pipes.set(
      posKey({ x: 1, y: 1 }),
      {
        id: 'changer',
        type: 'color_changer',
        gridPosition: { x: 1, y: 1 },
        rotation: 0,
        targetColor: 'purple',
      }
    );

    const sources: SourceNode[] = [
      {
        id: 's1',
        position: { x: 1, y: 0 },
        direction: 'down',
        color: 'blue',
        amount: 10,
      },
    ];

    const targets: TargetNode[] = [
      {
        id: 't1',
        position: { x: 1, y: 2 },
        acceptDirection: 'up',
        color: 'purple',
        requiredAmount: 10,
        currentAmount: 0,
      },
    ];

    const result = FlowSimulator.simulate({
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    });

    expect(result.connectedTargetIds).toContain('t1');
    expect(result.pipeFlowColors.get('changer')).toBe('blue');
  });

  it('respects gate open/closed state', () => {
    const pipes = new Map<string, PipeNode>();
    pipes.set(
      posKey({ x: 1, y: 1 }),
      {
        id: 'gate1',
        type: 'gate',
        gridPosition: { x: 1, y: 1 },
        rotation: 0,
        isOpen: false, // CLOSED
      }
    );

    const sources: SourceNode[] = [
      {
        id: 's1',
        position: { x: 1, y: 0 },
        direction: 'down',
        color: 'green',
        amount: 10,
      },
    ];

    const targets: TargetNode[] = [
      {
        id: 't1',
        position: { x: 1, y: 2 },
        acceptDirection: 'up',
        color: 'green',
        requiredAmount: 10,
        currentAmount: 0,
      },
    ];

    const resultClosed = FlowSimulator.simulate({
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    });

    expect(resultClosed.connectedTargetIds).not.toContain('t1');

    // Open gate
    pipes.get(posKey({ x: 1, y: 1 }))!.isOpen = true;
    const resultOpen = FlowSimulator.simulate({
      width: 3,
      height: 3,
      pipes,
      sources,
      targets,
    });

    expect(resultOpen.connectedTargetIds).toContain('t1');
  });
});
