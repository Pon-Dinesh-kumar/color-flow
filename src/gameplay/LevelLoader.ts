import { LevelConfig } from './Level';
import { LEVELS } from '../data/levels/levelsData';
import { LevelValidator, ValidationResult } from './LevelValidator';

export class LevelLoader {
  private static customLevels: Map<string, LevelConfig> = new Map();

  public static getAllLevels(): LevelConfig[] {
    return [...LEVELS, ...Array.from(this.customLevels.values())];
  }

  public static getLevelByNumber(num: number): LevelConfig | undefined {
    return this.getAllLevels().find((l) => l.number === num);
  }

  public static getLevelById(id: string): LevelConfig | undefined {
    return this.getAllLevels().find((l) => l.id === id);
  }

  public static registerCustomLevel(level: LevelConfig): ValidationResult {
    const validation = LevelValidator.validate(level);
    if (validation.valid) {
      this.customLevels.set(level.id, level);
    }
    return validation;
  }

  public static getLevelCount(): number {
    return this.getAllLevels().length;
  }
}
