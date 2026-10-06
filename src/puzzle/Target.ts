import { Direction, GridPosition } from './Grid';
import { FlowColor } from './ColorSystem';

export interface TargetNode {
  id: string;
  position: GridPosition;
  acceptDirection: Direction; // the port on the target receiving flow (e.g. 'up' means receives flow coming from above)
  color: FlowColor;
  requiredAmount: number;
  currentAmount: number;
  isCompleted?: boolean;
}
