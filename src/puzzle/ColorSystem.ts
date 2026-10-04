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
    hex: '#ff1744',
    hexNumber: 0xff1744,
    emissive: 0x6b071c,
    glow: 'rgba(255, 23, 68, 0.7)',
    lightHex: '#ff8a9e',
    darkHex: '#b80024',
    tailwindBg: 'bg-red-500',
    tailwindBorder: 'border-red-400',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    hex: '#0867ff',
    hexNumber: 0x0867ff,
    emissive: 0x062b75,
    glow: 'rgba(8, 103, 255, 0.7)',
    lightHex: '#78b2ff',
    darkHex: '#0644c2',
    tailwindBg: 'bg-blue-500',
    tailwindBorder: 'border-blue-400',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    hex: '#ffc400',
    hexNumber: 0xffc400,
    emissive: 0x684300,
    glow: 'rgba(255, 196, 0, 0.7)',
    lightHex: '#ffe27a',
    darkHex: '#bb8000',
    tailwindBg: 'bg-amber-500',
    tailwindBorder: 'border-amber-400',
  },
  green: {
    id: 'green',
    name: 'Green',
    hex: '#00d978',
    hexNumber: 0x00d978,
    emissive: 0x004d2a,
    glow: 'rgba(0, 217, 120, 0.7)',
    lightHex: '#7affbd',
    darkHex: '#008847',
    tailwindBg: 'bg-emerald-500',
    tailwindBorder: 'border-emerald-400',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    hex: '#b52cff',
    hexNumber: 0xb52cff,
    emissive: 0x420066,
    glow: 'rgba(181, 44, 255, 0.7)',
    lightHex: '#e2a1ff',
    darkHex: '#7312bd',
    tailwindBg: 'bg-purple-500',
    tailwindBorder: 'border-purple-400',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    hex: '#ff711f',
    hexNumber: 0xff711f,
    emissive: 0x662300,
    glow: 'rgba(255, 113, 31, 0.7)',
    lightHex: '#ffb17a',
    darkHex: '#bb3c00',
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
