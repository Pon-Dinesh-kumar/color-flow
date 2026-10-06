import { Direction, GridPosition } from './Grid';
import { FlowColor } from './ColorSystem';

export interface FlowWaypoint {
  position: GridPosition;
  color: FlowColor;
  inDirection?: Direction;
  outDirection?: Direction;
  pipeId?: string;
  sourceId?: string;
  targetId?: string;
  isSource?: boolean;
  isTarget?: boolean;
}

export interface FlowPath {
  id: string;
  sourceId: string;
  color: FlowColor;
  waypoints: FlowWaypoint[];
  reachesTarget: boolean;
  targetId?: string;
  mismatchedColor?: boolean; // reached a target but wrong color
}

export interface FlowResult {
  paths: FlowPath[];
  connectedTargetIds: string[];
  mismatchedTargetIds: string[];
  activePipes: Set<string>; // set of pipe IDs carrying flow
  pipeFlowColors: Map<string, FlowColor>; // pipe ID -> current color flowing through it
}
