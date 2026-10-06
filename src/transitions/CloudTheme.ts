export type CloudThemeId = 'default' | 'sunset' | 'night' | 'fantasy';

export interface CloudThemeColors {
  id: CloudThemeId;
  name: string;
  // Primary cloud face (bright white with slight sky-pearl tone)
  primary: string;
  // Secondary underside & sky bounce tone (matching app background sky blue)
  secondary: string;
  // Deep ambient underbelly shadow (rich lavender / violet tint)
  shadow: string;
  // Crevice tone (deepest folds between billows)
  deepShadow: string;
  // Crisp sunlit highlight
  highlight: string;
  // Warm golden sun rim highlight matching app key sun
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
  // Default: Tuned with subtle sky tones matching Color Flow's app background sky & sunlight
  default: {
    id: 'default',
    name: 'Soft Blue / Lavender',
    primary: '#f8fafc',
    secondary: '#38bdf8', // matches the bright blue sky from default_background.jpg
    shadow: '#818cf8', // periwinkle-lavender underbelly matching the horizon
    deepShadow: '#6366f1', // deep cloud fold indigo
    highlight: '#ffffff',
    warmHighlight: '#fef08a', // warm golden sun rim from the app background key light
    lightRay: 'rgba(254, 240, 138, 0.65)',
    motionStreak: ['#38bdf8', '#93c5fd', '#fef08a', '#818cf8'],
    skyTop: '#0284c7',
    skyBottom: '#93c5fd',
    coreGlow: 'rgba(56, 189, 248, 0.75)',
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
