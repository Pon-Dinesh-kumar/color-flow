import { Direction, GridPosition, rotateDirection } from './Grid';
import { FlowColor } from './ColorSystem';

export type PipeType =
  | 'straight'
  | 'corner'
  | 't_junction'
  | 'cross'
  | 'splitter'
  | 'merger'
  | 'gate'
  | 'one_way'
  | 'color_changer'
  | 'end'
  | 'blocker';

export interface PipeNode {
  id: string;
  type: PipeType;
  gridPosition: GridPosition;
  rotation: number; // 0, 90, 180, 270 in degrees
  locked?: boolean; // if true, player cannot rotate this pipe
  isOpen?: boolean; // for gate pipes (default true)
  targetColor?: FlowColor; // for color_changer pipes
}

/**
 * Returns default untransformed connection ports at rotation = 0.
 * For directional pipes (one_way, splitter, merger), also defines directional constraints.
 */
export function getBaseConnections(type: PipeType): Direction[] {
  switch (type) {
    case 'straight':
      return ['up', 'down'];
    case 'corner':
      // 90-degree elbow connecting up and right at rotation 0
      return ['up', 'right'];
    case 't_junction':
      return ['up', 'left', 'right'];
    case 'cross':
      return ['up', 'down', 'left', 'right'];
    case 'splitter':
      // Input from up, outputs to left and right at rotation 0
      return ['up', 'left', 'right'];
    case 'merger':
      // Inputs from left and right, output to down at rotation 0
      return ['left', 'right', 'down'];
    case 'gate':
      return ['up', 'down'];
    case 'one_way':
      return ['up', 'down'];
    case 'color_changer':
      return ['up', 'down'];
    case 'end':
      return ['up'];
    case 'blocker':
      return [];
    default:
      return [];
  }
}

/**
 * Returns actual open port directions considering rotation.
 */
export function getActiveConnections(pipe: PipeNode): Direction[] {
  if (pipe.type === 'blocker') return [];
  if (pipe.type === 'gate' && pipe.isOpen === false) return [];

  const base = getBaseConnections(pipe.type);
  return base.map((dir) => rotateDirection(dir, pipe.rotation));
}

/**
 * Checks if a pipe can accept flow entering from an adjacent neighbor in direction `fromDir`
 * (fromDir is the direction relative to THIS pipe, e.g. 'up' means flow is entering THIS pipe through its top port).
 */
export function canAcceptFlowFrom(pipe: PipeNode, enteringPort: Direction): boolean {
  if (pipe.type === 'blocker') return false;
  if (pipe.type === 'gate' && pipe.isOpen === false) return false;

  const activePorts = getActiveConnections(pipe);
  if (!activePorts.includes(enteringPort)) return false;

  // Directional constraints
  if (pipe.type === 'one_way') {
    // One way at rotation 0 enters from 'up' and exits to 'down'
    const allowedInput = rotateDirection('up', pipe.rotation);
    return enteringPort === allowedInput;
  }

  if (pipe.type === 'splitter') {
    // Splitter at rotation 0 takes input only from 'up'
    const allowedInput = rotateDirection('up', pipe.rotation);
    return enteringPort === allowedInput;
  }

  if (pipe.type === 'merger') {
    // Merger at rotation 0 takes input from 'left' or 'right', exits 'down'
    const allowedInput1 = rotateDirection('left', pipe.rotation);
    const allowedInput2 = rotateDirection('right', pipe.rotation);
    return enteringPort === allowedInput1 || enteringPort === allowedInput2;
  }

  return true;
}

/**
 * Given flow entering through `enteringPort`, returns the outgoing ports.
 */
export function getOutgoingPorts(pipe: PipeNode, enteringPort: Direction): Direction[] {
  if (!canAcceptFlowFrom(pipe, enteringPort)) return [];

  const activePorts = getActiveConnections(pipe);

  if (pipe.type === 'one_way') {
    const exitPort = rotateDirection('down', pipe.rotation);
    return [exitPort];
  }

  if (pipe.type === 'splitter') {
    const exit1 = rotateDirection('left', pipe.rotation);
    const exit2 = rotateDirection('right', pipe.rotation);
    return [exit1, exit2];
  }

  if (pipe.type === 'merger') {
    const exitPort = rotateDirection('down', pipe.rotation);
    return [exitPort];
  }

  // For regular pipes, outgoing ports are all active ports EXCEPT the entering port
  return activePorts.filter((p) => p !== enteringPort);
}
