export type AnalyticsEventName =
  | 'game_started'
  | 'session_started'
  | 'session_ended'
  | 'level_started'
  | 'level_completed'
  | 'level_failed'
  | 'level_restarted'
  | 'pipe_rotated'
  | 'objective_completed'
  | 'tutorial_shown'
  | 'tutorial_completed';

class AnalyticsServiceImpl {
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
    this.startTime = Date.now();
  }

  public track(event: AnalyticsEventName, properties: Record<string, any> = {}) {
    const payload = {
      event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsedSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      ...properties,
    };

    // Keep console log clean in production, track internally or forward to Supabase / analytics provider
    if (process.env.NODE_ENV === 'development') {
      // console.debug('[Analytics]', event, payload);
    }
  }
}

export const AnalyticsService = new AnalyticsServiceImpl();
