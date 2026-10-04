export type FlowColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange';

export interface ColorDef {
  id: FlowColor;
  name: string;
  hex: string;
  hexNumber: number;
  emissive: number;
  glow: string;
  lightHex: string;
  darkHex: string;
  tailwindBg: string;
  tailwindBorder: string;
}

export const COLOR_PALETTE: Record<FlowColor, ColorDef> = {
  red: {
    id: 'red',
    name: 'Red',
    hex: '#ef4444',
    hexNumber: 0xef4444,
    emissive: 0x5a1111,
    glow: 'rgba(239, 68, 68, 0.6)',
    lightHex: '#fca5a5',
    darkHex: '#991b1b',
    tailwindBg: 'bg-red-500',
    tailwindBorder: 'border-red-400',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    hex: '#3b82f6',
    hexNumber: 0x3b82f6,
    emissive: 0x0f2b5c,
    glow: 'rgba(59, 130, 246, 0.6)',
    lightHex: '#93c5fd',
    darkHex: '#1e40af',
    tailwindBg: 'bg-blue-500',
    tailwindBorder: 'border-blue-400',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    hex: '#f59e0b',
    hexNumber: 0xf59e0b,
    emissive: 0x5c3c05,
    glow: 'rgba(245, 158, 11, 0.6)',
    lightHex: '#fde68a',
    darkHex: '#92400e',
    tailwindBg: 'bg-amber-500',
    tailwindBorder: 'border-amber-400',
  },
  green: {
    id: 'green',
    name: 'Green',
    hex: '#10b981',
    hexNumber: 0x10b981,
    emissive: 0x06402b,
    glow: 'rgba(16, 185, 129, 0.6)',
    lightHex: '#a7f3d0',
    darkHex: '#065f46',
    tailwindBg: 'bg-emerald-500',
    tailwindBorder: 'border-emerald-400',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    hex: '#a855f7',
    hexNumber: 0xa855f7,
    emissive: 0x3b0f5c,
    glow: 'rgba(168, 85, 247, 0.6)',
    lightHex: '#e9d5ff',
    darkHex: '#581c87',
    tailwindBg: 'bg-purple-500',
    tailwindBorder: 'border-purple-400',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    hex: '#f97316',
    hexNumber: 0xf97316,
    emissive: 0x5c2605,
    glow: 'rgba(249, 115, 22, 0.6)',
    lightHex: '#fed7aa',
    darkHex: '#9a3412',
    tailwindBg: 'bg-orange-500',
    tailwindBorder: 'border-orange-400',
  },
};

/**
 * Color transformation rules for ColorChanger pipes
 */
export function getTransformedColor(inputColor: FlowColor, targetRule?: FlowColor): FlowColor {
  if (targetRule) return targetRule;
  // Default mixing/transform rules
  switch (inputColor) {
    case 'blue':
      return 'purple';
    case 'yellow':
      return 'green';
    case 'red':
      return 'orange';
    case 'green':
      return 'yellow';
    default:
      return 'blue';
  }
}
