/**
 * Centralized Design Tokens for Color Flow UI
 */
export const UI = {
  radius: {
    sm: 'rounded-xl', // 12px
    md: 'rounded-2xl', // 16px
    lg: 'rounded-3xl', // 24px
    pill: 'rounded-full',
  },

  shadow: {
    floating: 'shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
    pill: 'shadow-[0_6px_20px_rgba(0,0,0,0.35)]',
    button: 'shadow-[0_6px_16px_rgba(0,0,0,0.4)]',
    buttonActive: 'shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
    glow: (colorHex: string) => `0 0 16px ${colorHex}`,
  },

  glass: {
    panel: 'bg-slate-900/80 backdrop-blur-xl border border-white/15',
    pill: 'bg-slate-900/85 backdrop-blur-lg border border-white/20',
    button: 'bg-slate-900/75 hover:bg-slate-800/85 active:bg-slate-950/90 backdrop-blur-md border border-white/20',
    buttonPrimary: 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 border-t border-white/30 text-white',
  },

  colors: {
    surface: '#0f172a',
    surfaceGlass: 'rgba(15, 23, 42, 0.85)',
    border: 'rgba(255, 255, 255, 0.18)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    accentGold: '#f59e0b',
    accentGreen: '#10b981',
  },
} as const;
