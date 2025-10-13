export interface Theme {
  id: string;
  name: string;
  description: string;
  cssFile: string;
}

export const THEMES: Theme[] = [
  {
    id: 'kodama-grove',
    name: 'Kodama Grove',
    description: 'A serene, nature-inspired theme with earthy green tones',
    cssFile: '/src/lib/themes/kodama-grove.css',
  },
  {
    id: 'doom-64',
    name: 'Doom 64',
    description: 'A dark, retro-futuristic theme inspired by classic gaming',
    cssFile: '/src/lib/themes/doom-64.css',
  },
];

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  theme: string;
  mode: ThemeMode;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  theme: 'kodama-grove',
  mode: 'light',
};
