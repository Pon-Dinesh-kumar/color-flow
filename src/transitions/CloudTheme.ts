export type CloudThemeId = 'default' | 'sunset' | 'night' | 'fantasy';

export interface CloudThemeColors {
  id: CloudThemeId;
  name: string;
  // Primary cloud face (bright white)
  primary: string;
  // Secondary underside & crease tone (rich soft sky blue / periwinkle)
  secondary: string;
  // Deep ambient underbelly shadow (rich lavender / violet tint from reference image)
  shadow: string;
  // Crevice tone (deepest folds between billows)
  deepShadow: string;
  // Crisp sunlit highlight
  highlight: string;
  // Warm golden sun rim highlight
  warmHighlight: string;
  // Volumetric light ray color
  lightRay: string;
  // Fly-through motion streaks
  motionStreak: string[];
  // Sky backdrop between cloud banks
  skyTop: string;
  skyBottom: string;
  // Ambient glow
  coreGlow: string;
}

export const CLOUD_THEMES: Record<CloudThemeId, CloudThemeColors> = {
  // Default: Soft Blue / Lavender (Exact match to storyboard reference: rich periwinkle underbellies, golden rim, crisp white crests)
  default: {
    id: 'default',
    name: 'Soft Blue / Lavender',
    primary: '#ffffff',
    secondary: '#93c5fd', // rich soft sky blue
    shadow: '#818cf8', // vibrant periwinkle/lavender underbelly
    deepShadow: '#6366f1', // deep cloud fold indigo
    highlight: '#ffffff',
    warmHighlight: '#fed7aa', // warm golden peach sun rim
    lightRay: 'rgba(254, 240, 138, 0.55)',
    motionStreak: ['#93c5fd', '#c7d2fe', '#fef08a', '#818cf8'],
    skyTop: '#60a5fa',
    skyBottom: '#a5b4fc',
    coreGlow: 'rgba(147, 197, 253, 0.75)',
  },

  // Sunset: Soft Pink / Peach / Golden Orange
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#ffffff',
    secondary: '#fbcfe8',
    shadow: '#f472b6',
    deepShadow: '#db2777',
    highlight: '#ffffff',
    warmHighlight: '#fde047',
    lightRay: 'rgba(254, 240, 138, 0.55)',
    motionStreak: ['#fed7aa', '#fbcfe8', '#fef08a'],
    skyTop: '#f472b6',
    skyBottom: '#fdba74',
    coreGlow: 'rgba(254, 215, 170, 0.75)',
  },

  // Night: Violet / Deep Blue
  night: {
    id: 'night',
    name: 'Moonlight Violet',
    primary: '#ffffff',
    secondary: '#818cf8',
    shadow: '#4f46e5',
    deepShadow: '#312e81',
    highlight: '#ffffff',
    warmHighlight: '#c084fc',
    lightRay: 'rgba(192, 132, 252, 0.45)',
    motionStreak: ['#a5b4fc', '#c084fc', '#818cf8'],
    skyTop: '#312e81',
    skyBottom: '#6366f1',
    coreGlow: 'rgba(99, 102, 241, 0.75)',
  },

  // Fantasy: Rainbow / Iridescent Pastel
  fantasy: {
    id: 'fantasy',
    name: 'Dream Rainbow',
    primary: '#ffffff',
    secondary: '#e9d5ff',
    shadow: '#818cf8',
    deepShadow: '#7c3aed',
    highlight: '#fef08a',
    warmHighlight: '#fbcfe8',
    lightRay: 'rgba(254, 240, 138, 0.5)',
    motionStreak: ['#fbcfe8', '#bae6fd', '#fef08a', '#c7d2fe'],
    skyTop: '#c084fc',
    skyBottom: '#38bdf8',
    coreGlow: 'rgba(251, 207, 232, 0.75)',
  },
};
