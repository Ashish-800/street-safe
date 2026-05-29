export const typography = {
  sizes: {
    micro: 11,
    caption: 12,
    body: 14,
    h3: 17,
    h2: 20,
    h1: 24,
    display: 32,
    hero: 40,
    // Aliases for backward compat
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  lineHeights: {
    body: 1.6,
    heading: 1.2,
  },
};
