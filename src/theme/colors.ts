// ============================================
//  src/theme/colors.ts
//  نفس لوحة ألوان نسخة الويب (أخضر داكن + ذهبي)
// ============================================

export const lightColors = {
  green900: '#1a3a26',
  green800: '#1e4d2f',
  green700: '#2d6a4f',
  green600: '#40916c',
  green500: '#52b788',
  green400: '#74c69d',
  green300: '#95d5b2',
  green200: '#b7e4c7',
  green100: '#d8f3dc',
  green50:  '#f0faf4',

  gold: '#c9a84c',
  goldLight: '#f0d080',
  red600: '#d62828',
  red100: '#fdecea',
  amber600: '#d4860a',
  amber100: '#fef3dc',
  blue600: '#1e6091',
  blue100: '#deeef9',

  bgBody: '#f4f7f5',
  bgSidebar: '#1e4d2f',
  bgCard: '#ffffff',
  bgInput: '#f8faf9',
  bgHeader: '#ffffff',
  bgOverlay: 'rgba(0,0,0,0.5)',

  textPrimary: '#1a2e20',
  textSecondary: '#4a6352',
  textMuted: '#7a9484',
  textInverse: '#ffffff',

  border: '#d4e6da',
  borderFocus: '#40916c',
};

export const darkColors: typeof lightColors = {
  ...lightColors,
  bgBody: '#0f1f14',
  bgSidebar: '#0a1510',
  bgCard: '#162419',
  bgInput: '#1a2e1f',
  bgHeader: '#162419',
  border: '#2a4030',
  borderFocus: '#52b788',
  textPrimary: '#e8f5ed',
  textSecondary: '#9dc8b0',
  textMuted: '#5e8a6f',
  red100: '#2d1216',
  amber100: '#2a1e08',
  blue100: '#0d1e2a',
  green50: '#1a2e20',
};

export type ThemeColors = typeof lightColors;

export const PARTNER_COLORS = [
  '#2d6a4f', '#40916c', '#1e6091', '#c9a84c',
  '#d62828', '#6d28d9', '#db2777', '#0891b2',
  '#059669', '#dc2626', '#7c3aed', '#b45309',
];
