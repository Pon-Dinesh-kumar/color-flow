import { GridPosition } from '../puzzle/Grid';
import { PipeNode } from '../puzzle/Pipe';
import { SourceNode } from '../puzzle/Source';
import { TargetNode } from '../puzzle/Target';

export interface LevelConfig {
  id: string;
  number: number;
  title: string;
  tutorialText?: string;
  grid: {
    width: number;
    height: number;
  };
  sources: SourceNode[];
  targets: TargetNode[];
  pipes: PipeNode[];
  maxMoves?: number;
  targetMoves?: number; // target moves for 3 stars
  hintPipePosition?: GridPosition; // coordinate of pipe for tutorial pulsing indicator
}
