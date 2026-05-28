export type ColorTheme = {
  primary: { base: string; light: string; dark: string };
  secondary: { base: string; light: string; dark: string };
  safe: { base: string; light: string; dark: string };
  warning: { base: string; light: string; dark: string };
  emergency: { base: string; light: string; dark: string };
  background: { base: string; paper: string; glass: string };
  text: { primary: string; secondary: string; tertiary: string; inverse: string };
  border: { base: string; strong: string; glow: string };
};

export const lightTheme: ColorTheme = {
  primary: {
    base: '#F97316', // Vibrant Orange
    light: '#FFEDD5',
    dark: '#C2410C',
  },
  secondary: {
    base: '#F59E0B', // Amber/Yellow
    light: '#FEF3C7',
    dark: '#B45309',
  },
  safe: {
    base: '#10B981', // Emerald Green
    light: '#D1FAE5',
    dark: '#047857',
  },
  warning: {
    base: '#F59E0B',
    light: '#FEF3C7',
    dark: '#B45309',
  },
  emergency: {
    base: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  background: {
    base: '#FFF9EF', // Warm Cream from reference
    paper: '#FFFFFF', // Pure white cards
    glass: 'rgba(255, 255, 255, 0.8)',
  },
  text: {
    primary: '#111827', // Dark gray almost black
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF', // White text on dark buttons
  },
  border: {
    base: '#FDE6CE', // Very soft orange-tinted border
    strong: '#E5E7EB',
    glow: '#F97316',
  },
};

export const darkTheme: ColorTheme = {
  primary: {
    base: '#F97316', // Orange pops on dark mode
    light: '#7C2D12',
    dark: '#EA580C',
  },
  secondary: {
    base: '#F59E0B',
    light: '#78350F',
    dark: '#D97706',
  },
  safe: {
    base: '#10B981',
    light: '#064E3B',
    dark: '#059669',
  },
  warning: {
    base: '#F59E0B',
    light: '#78350F',
    dark: '#D97706',
  },
  emergency: {
    base: '#EF4444',
    light: '#7F1D1D',
    dark: '#DC2626',
  },
  background: {
    base: '#111827', // Very dark slate
    paper: '#1F2937', // Slightly lighter slate cards
    glass: 'rgba(31, 41, 55, 0.8)',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    inverse: '#111827',
  },
  border: {
    base: '#374151',
    strong: '#4B5563',
    glow: '#F97316',
  },
};

// For backwards compatibility before context is wired up everywhere
export const colors = lightTheme;
