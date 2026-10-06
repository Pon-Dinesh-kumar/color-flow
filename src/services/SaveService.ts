export interface PlayerProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelNumber -> stars (1..3)
  levelScores: Record<number, number>;
  sfx: boolean;
  music: boolean;
}

const STORAGE_KEY = 'color_flow_save_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  levelStars: {},
  levelScores: {},
  sfx: true,
  music: true,
};

class SaveServiceImpl {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.loadLocal();
  }

  private loadLocal(): PlayerProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PROGRESS };
  }

  private saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // Ignore
    }
  }

  public getProgress(): PlayerProgress {
    return { ...this.progress };
  }

  public getUnlockedLevel(): number {
    return this.progress.unlockedLevel;
  }

  public getStarsForLevel(levelNum: number): number {
    return this.progress.levelStars[levelNum] || 0;
  }

  public completeLevel(levelNum: number, stars: number, score: number) {
    const prevStars = this.progress.levelStars[levelNum] || 0;
    this.progress.levelStars[levelNum] = Math.max(prevStars, stars);

    const prevScore = this.progress.levelScores[levelNum] || 0;
    this.progress.levelScores[levelNum] = Math.max(prevScore, score);

    if (levelNum >= this.progress.unlockedLevel) {
      this.progress.unlockedLevel = levelNum + 1;
    }

    this.saveLocal();
  }

  public saveSettings(sfx: boolean, music: boolean) {
    this.progress.sfx = sfx;
    this.progress.music = music;
    this.saveLocal();
  }

  public resetProgress() {
    this.progress = { ...DEFAULT_PROGRESS };
    this.saveLocal();
  }
}

export const SaveService = new SaveServiceImpl();
