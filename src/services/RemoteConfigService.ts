export interface GameRemoteConfig {
  ballSpeed: number; // units per second
  ballSpawnInterval: number; // ms
  pipeRotateDuration: number; // seconds
  particleDensity: number; // 0..1
  celebrationDuration: number; // seconds
}

const DEFAULT_CONFIG: GameRemoteConfig = {
  ballSpeed: 3.4, // units per second (Section 7: 2.0 - 4.0 units/sec)
  ballSpawnInterval: 220, // ms (Section 7: 0.1 - 0.3s)
  pipeRotateDuration: 0.28,
  particleDensity: 1.0,
  celebrationDuration: 2.2,
};

class RemoteConfigServiceImpl {
  private config: GameRemoteConfig = { ...DEFAULT_CONFIG };

  public getConfig(): GameRemoteConfig {
    return this.config;
  }

  public get<K extends keyof GameRemoteConfig>(key: K): GameRemoteConfig[K] {
    return this.config[key];
  }

  public updateConfig(partial: Partial<GameRemoteConfig>) {
    this.config = { ...this.config, ...partial };
  }
}

export const RemoteConfigService = new RemoteConfigServiceImpl();
