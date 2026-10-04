import { describe, it, expect } from 'vitest';
import {
  getActiveConnections,
  canAcceptFlowFrom,
  getOutgoingPorts,
  PipeNode,
} from './Pipe';

describe('Pipe Connections & Rotations', () => {
  it('straight pipe rotations', () => {
    const pipe: PipeNode = {
      id: 'p1',
      type: 'straight',
      gridPosition: { x: 0, y: 0 },
      rotation: 0,
    };

    expect(getActiveConnections(pipe)).toEqual(['up', 'down']);

    pipe.rotation = 90;
    expect(getActiveConnections(pipe)).toEqual(['right', 'left']);
  });

  it('splitter directs flow from input to dual outputs', () => {
    const splitter: PipeNode = {
      id: 'sp1',
      type: 'splitter',
      gridPosition: { x: 1, y: 1 },
      rotation: 0, // input is 'up', outputs are 'left' and 'right'
    };

    expect(canAcceptFlowFrom(splitter, 'up')).toBe(true);
    expect(canAcceptFlowFrom(splitter, 'down')).toBe(false);
    expect(canAcceptFlowFrom(splitter, 'left')).toBe(false);

    const out = getOutgoingPorts(splitter, 'up');
    expect(out).toContain('left');
    expect(out).toContain('right');
  });

  it('merger directs flow from two inputs into one output', () => {
    const merger: PipeNode = {
      id: 'm1',
      type: 'merger',
      gridPosition: { x: 1, y: 1 },
      rotation: 0, // inputs from 'left' and 'right', output to 'down'
    };

    expect(canAcceptFlowFrom(merger, 'left')).toBe(true);
    expect(canAcceptFlowFrom(merger, 'right')).toBe(true);
    expect(canAcceptFlowFrom(merger, 'down')).toBe(false);

    expect(getOutgoingPorts(merger, 'left')).toEqual(['down']);
    expect(getOutgoingPorts(merger, 'right')).toEqual(['down']);
  });

  it('one-way pipe only allows flow in directed forward direction', () => {
    const oneWay: PipeNode = {
      id: 'ow1',
      type: 'one_way',
      gridPosition: { x: 0, y: 0 },
      rotation: 0, // allows flow from 'up' to 'down'
    };

    expect(canAcceptFlowFrom(oneWay, 'up')).toBe(true);
    expect(canAcceptFlowFrom(oneWay, 'down')).toBe(false);
    expect(getOutgoingPorts(oneWay, 'up')).toEqual(['down']);
  });
});
