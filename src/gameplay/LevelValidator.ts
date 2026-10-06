import { LevelConfig } from './Level';
import { isInsideGrid, posKey } from '../puzzle/Grid';
import { FlowSimulator } from '../puzzle/FlowSimulator';
import { PipeNode } from '../puzzle/Pipe';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class LevelValidator {
  public static validate(level: LevelConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const { width, height } = level.grid;

    if (width < 3 || height < 3) {
      errors.push(`Grid dimensions too small: ${width}x${height}`);
    }

    if (!level.sources || level.sources.length === 0) {
      errors.push('Level has no sources defined');
    }

    if (!level.targets || level.targets.length === 0) {
      errors.push('Level has no targets defined');
    }

    const occupiedPositions = new Set<string>();

    // Validate sources
    for (const source of level.sources || []) {
      const key = posKey(source.position);
      if (!isInsideGrid(source.position, width, height)) {
        errors.push(`Source ${source.id} is outside grid boundaries at (${source.position.x}, ${source.position.y})`);
      }
      if (occupiedPositions.has(key)) {
        errors.push(`Duplicate element position at (${source.position.x}, ${source.position.y})`);
      }
      occupiedPositions.add(key);
    }

    // Validate targets
    for (const target of level.targets || []) {
      const key = posKey(target.position);
      if (!isInsideGrid(target.position, width, height)) {
        errors.push(`Target ${target.id} is outside grid boundaries at (${target.position.x}, ${target.position.y})`);
      }
      if (occupiedPositions.has(key)) {
        errors.push(`Target overlaps existing cell at (${target.position.x}, ${target.position.y})`);
      }
      occupiedPositions.add(key);
    }

    // Validate pipes
    for (const pipe of level.pipes || []) {
      const key = posKey(pipe.gridPosition);
      if (!isInsideGrid(pipe.gridPosition, width, height)) {
        errors.push(`Pipe ${pipe.id} is outside grid boundaries at (${pipe.gridPosition.x}, ${pipe.gridPosition.y})`);
      }
      if (occupiedPositions.has(key)) {
        errors.push(`Pipe ${pipe.id} overlaps existing cell at (${pipe.gridPosition.x}, ${pipe.gridPosition.y})`);
      }
      occupiedPositions.add(key);
    }

    // Check color coverage
    const sourceColors = new Set(level.sources.map((s) => s.color));
    const targetColors = new Set(level.targets.map((t) => t.color));
    for (const tc of targetColors) {
      // If target color is not directly in sources, check if any color_changer pipe exists
      if (!sourceColors.has(tc)) {
        const hasColorChanger = level.pipes.some((p) => p.type === 'color_changer');
        if (!hasColorChanger) {
          warnings.push(`Target requires color '${tc}', but no source produces it and no color changer is present.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Diagnostic test checking if current pipe configuration satisfies all targets.
   */
  public static testCurrentConfiguration(level: LevelConfig): {
    completedTargets: string[];
    missingTargets: string[];
    mismatchedTargets: string[];
  } {
    const pipeMap = new Map<string, PipeNode>();
    for (const p of level.pipes) {
      pipeMap.set(posKey(p.gridPosition), p);
    }

    const sim = FlowSimulator.simulate({
      width: level.grid.width,
      height: level.grid.height,
      pipes: pipeMap,
      sources: level.sources,
      targets: level.targets,
    });

    const targetIds = level.targets.map((t) => t.id);
    const completedTargets = targetIds.filter((id) => sim.connectedTargetIds.includes(id));
    const missingTargets = targetIds.filter((id) => !sim.connectedTargetIds.includes(id));
    const mismatchedTargets = sim.mismatchedTargetIds;

    return {
      completedTargets,
      missingTargets,
      mismatchedTargets,
    };
  }
}
