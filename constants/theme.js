const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// constants/theme.js
export const COLORS = {
  primary: '#382109',       // Deep brand accent color
  secondary: '#468275',     // Green variant used on primary buttons
  accentPeach: '#FFB3A7',   // Background top gradient block 
  backgroundLight: '#F8F9FA',
  textDark: '#111827',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  
  // Status from Home mockup
  statusInProgress: '#22C55E',
  statusUpcoming: '#F97316',
  statusDrink: '#6366F1',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 44, 
};
export default {
  light: {
    text: COLORS.textDark,
    background: COLORS.backgroundLight,
    tint: COLORS.primary,               // Active tab navigation line/icon color
    tabIconDefault: COLORS.textMuted,   // Inactive tab bar icons
    tabIconSelected: COLORS.primary,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
  },

};
