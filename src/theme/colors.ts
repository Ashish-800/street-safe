export type ColorTheme = {
  primary: string;
  primaryDark: string;
  primaryBg: string;
  safe: string;
  safeBg: string;
  warning: string;
  warningBg: string;
  emergency: string;
  emergencyBg: string;
  info: string;
  infoBg: string;
  background: string;
  paper: string;
  paperAlt: string;
  text: string;
  textSub: string;
  textMuted: string;
  border: string;
  navBg: string;
};

export const lightTheme: ColorTheme = {
  primary:     '#F97316',  // Orange
  primaryDark: '#EA580C',  // Deep Orange
  primaryBg:   '#FFF3E8',  // Cream Orange
  safe:        '#10B981',  // Emerald
  safeBg:      '#ECFDF5',
  warning:     '#F59E0B',  // Amber
  warningBg:   '#FFFBEB',
  emergency:   '#EF4444',  // Crimson
  emergencyBg: '#FEF2F2',
  info:        '#3B82F6',  // Blue
  infoBg:      '#EFF6FF',
  background:  '#FFF9EF',  // Warm Cream
  paper:       '#FFFFFF',  // Pure White
  paperAlt:    '#FFF5E6',  // Warm White
  text:        '#111827',  // Near Black
  textSub:     '#4B5563',  // Mid Gray
  textMuted:   '#9CA3AF',  // Light Gray
  border:      '#FDE6CE',  // Cream Border
  navBg:       '#FFFFFF',
};

export const darkTheme: ColorTheme = {
  primary:     '#F97316',
  primaryDark: '#EA580C',
  primaryBg:   '#2A1A0A',  // Deep warm
  safe:        '#10B981',
  safeBg:      '#052E1B',
  warning:     '#F59E0B',
  warningBg:   '#1C1500',
  emergency:   '#EF4444',
  emergencyBg: '#1C0606',
  info:        '#3B82F6',
  infoBg:      '#0C1929',
  background:  '#0C0C0E',  // Near Black
  paper:       '#1A1A1F',  // Dark Surface
  paperAlt:    '#141418',
  text:        '#F9FAFB',
  textSub:     '#D1D5DB',
  textMuted:   '#6B7280',
  border:      '#2D2D35',
  navBg:       '#12121A',
};

// Backward compat
export const colors = lightTheme;
