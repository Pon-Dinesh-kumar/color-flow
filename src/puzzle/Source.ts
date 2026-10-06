import { Direction, GridPosition } from './Grid';
import { FlowColor } from './ColorSystem';

export interface SourceNode {
  id: string;
  position: GridPosition;
  direction: Direction; // direction in which flow enters the grid (e.g. 'down')
  color: FlowColor;
  amount: number;
}
