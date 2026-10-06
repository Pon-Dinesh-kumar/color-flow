import { CloudThemeId } from './CloudTheme';

export type TransitionDirection = 'center' | 'left' | 'right' | 'bottom';

export interface TransitionOptions {
  from?: string;
  to?: string;
  direction?: TransitionDirection;
  theme?: CloudThemeId;
  onPageSwitch?: () => void;
  onComplete?: () => void;
}

export interface TransitionState {
  isActive: boolean;
  progress: number; // 0.0 to 1.2
  from: string;
  to: string;
  direction: TransitionDirection;
  theme: CloudThemeId;
  isLocked: boolean;
}

type Listener = (state: TransitionState) => void;

class CloudTransitionManagerImpl {
  private state: TransitionState = {
    isActive: false,
    progress: 0,
    from: 'home',
    to: 'levels',
    direction: 'center',
    theme: 'default',
    isLocked: false,
  };

  private listeners: Set<Listener> = new Set();
  private pendingRequest: TransitionOptions | null = null;

  public getState(): TransitionState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  /**
   * Main API specified by the reference document:
   * CloudTransitionManager.transition({
   *   from: currentPage,
   *   to: nextPage,
   *   direction: "center" | "left" | "right" | "bottom",
   *   theme: "default",
   *   onPageSwitch: () => void,
   *   onComplete?: () => void,
   * });
   */
  public transition(options: TransitionOptions) {
    if (this.state.isActive) {
      // If already active, invoke page switch immediately to prevent dropping user navigation
      options.onPageSwitch?.();
      options.onComplete?.();
      return;
    }

    this.pendingRequest = options;
    this.state = {
      isActive: true,
      progress: 0,
      from: options.from || 'pageA',
      to: options.to || 'pageB',
      direction: options.direction || 'center',
      theme: options.theme || 'default',
      isLocked: true,
    };
    this.notify();
  }

  public getPendingRequest(): TransitionOptions | null {
    return this.pendingRequest;
  }

  public finishTransition() {
    const req = this.pendingRequest;
    this.pendingRequest = null;
    this.state = {
      ...this.state,
      isActive: false,
      progress: 1.2,
      isLocked: false,
    };
    this.notify();
    req?.onComplete?.();
  }

  public isNavLocked(): boolean {
    return this.state.isLocked;
  }
}

export const CloudTransitionManager = new CloudTransitionManagerImpl();
