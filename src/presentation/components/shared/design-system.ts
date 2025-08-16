export const Colors = {
  // Cores Principais - Verde Oliveira
  primary: '#556B2F', // Verde oliveira escuro
  secondary: '#8FBC8F', // Verde oliveira claro
  accent: '#6B8E23', // Verde oliveira médio

  // Cores Neutras
  white: '#ffffff',
  lightGray: '#f8f9fa',
  gray: '#6c757d',
  darkGray: '#343a40',
  black: '#000000',

  // Cores de Status
  success: '#556B2F', // Verde oliveira escuro
  warning: '#DAA520', // Dourado
  danger: '#DC143C', // Vermelho
  info: '#4682B4', // Azul aço

  // Gradientes Modernos
  primaryGradient: ['#556B2F', '#8FBC8F'],
  secondaryGradient: ['#8FBC8F', '#6B8E23'],
  backgroundGradient: ['#0F1419', '#1A2332', '#2D3748'],
  glassGradient: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  overlayGradient: ['rgba(85, 107, 47, 0.8)', 'rgba(107, 142, 35, 0.6)'],

  // Cores Glassmorphism
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Cores de Glow
  glow: {
    primary: 'rgba(85, 107, 47, 0.6)',
    secondary: 'rgba(107, 142, 35, 0.4)',
    white: 'rgba(255, 255, 255, 0.3)',
  },

  // Cores de Background
  background: {
    default: '#ffffff',
    disabled: '#f5f5f5',
  },

  // Cores de Texto
  text: {
    primary: '#000000',
    secondary: '#6c757d',
  },

  // Cores de Border
  border: {
    default: '#dee2e6',
    light: '#f8f9fa',
  },
} as const;

export const Typography = {
  // Fontes
  fontFamily: {
    primary: 'Inter',
    secondary: 'Poppins',
  },
  fontFamilyPrimary: 'Inter',
  fontFamilySecondary: 'Poppins',

  // Tamanhos
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeBase: 16,
  fontSizeLg: 18,
  fontSizeXl: 20,
  fontSize2xl: 24,
  fontSize3xl: 30,
  fontSize4xl: 36,

  // Pesos
  fontWeightLight: '300',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  glow: {
    shadowColor: '#556B2F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glass: {
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 6,
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type TypographyKey = keyof typeof Typography;
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type ShadowKey = keyof typeof Shadows;
