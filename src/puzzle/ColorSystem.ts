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
    hex: '#FF3045',
    hexNumber: 0xFF3045,
    emissive: 0x7A0D1B,
    glow: 'rgba(255, 48, 69, 0.75)',
    lightHex: '#FF7080',
    darkHex: '#C71B2D',
    tailwindBg: 'bg-[#FF3045]',
    tailwindBorder: 'border-[#FF7080]',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    hex: '#168BFF',
    hexNumber: 0x168BFF,
    emissive: 0x073E8A,
    glow: 'rgba(22, 139, 255, 0.75)',
    lightHex: '#6BB3FF',
    darkHex: '#0D62BA',
    tailwindBg: 'bg-[#168BFF]',
    tailwindBorder: 'border-[#6BB3FF]',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    hex: '#FFC21C',
    hexNumber: 0xFFC21C,
    emissive: 0x8A6100,
    glow: 'rgba(255, 194, 28, 0.75)',
    lightHex: '#FFE078',
    darkHex: '#C49000',
    tailwindBg: 'bg-[#FFC21C]',
    tailwindBorder: 'border-[#FFE078]',
  },
  green: {
    id: 'green',
    name: 'Green',
    hex: '#24D964',
    hexNumber: 0x24D964,
    emissive: 0x0A6627,
    glow: 'rgba(36, 217, 100, 0.75)',
    lightHex: '#73F2A0',
    darkHex: '#159942',
    tailwindBg: 'bg-[#24D964]',
    tailwindBorder: 'border-[#73F2A0]',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    hex: '#A855F7',
    hexNumber: 0xA855F7,
    emissive: 0x4B1A7E,
    glow: 'rgba(168, 85, 247, 0.75)',
    lightHex: '#D1A3FF',
    darkHex: '#7924CE',
    tailwindBg: 'bg-[#A855F7]',
    tailwindBorder: 'border-[#D1A3FF]',
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    hex: '#FF7A1A',
    hexNumber: 0xFF7A1A,
    emissive: 0x803300,
    glow: 'rgba(255, 122, 26, 0.75)',
    lightHex: '#FFA866',
    darkHex: '#CC5500',
    tailwindBg: 'bg-[#FF7A1A]',
    tailwindBorder: 'border-[#FFA866]',
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
