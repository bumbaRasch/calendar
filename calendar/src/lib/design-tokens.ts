/**
 * Design Tokens for Calendar Application
 * Centralized design system configuration (2025)
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Semantic Colors
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Calendar-specific Colors
  calendar: {
    today: '#fef3c7',
    todayText: '#92400e',
    past: '#f9fafb',
    pastText: '#6b7280',
    weekend: '#fefce8',
    weekendText: '#713f12',
    selected: '#ddd6fe',
    selectedText: '#5b21b6',
  },
  
  // Event Category Colors
  eventCategories: {
    work: '#3b82f6',
    personal: '#10b981',
    meeting: '#f59e0b',
    holiday: '#ef4444',
    deadline: '#8b5cf6',
    travel: '#06b6d4',
    health: '#84cc16',
    social: '#ec4899',
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Consolas',
      '"Liberation Mono"',
      'Menlo',
      'monospace',
    ],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Border Radius Scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Shadow Scale
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  calendar: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  event: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// Animation Durations
export const animation = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1020',
  banner: '1030',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
  notification: '1080',
} as const;

// Component-specific tokens
export const components = {
  calendar: {
    cellMinHeight: '120px',
    eventHeight: '24px',
    eventSpacing: '2px',
    headerHeight: '64px',
  },
  
  event: {
    colors: {
      work: colors.eventCategories.work,
      personal: colors.eventCategories.personal,
      meeting: colors.eventCategories.meeting,
      holiday: colors.eventCategories.holiday,
      deadline: colors.eventCategories.deadline,
      travel: colors.eventCategories.travel,
      health: colors.eventCategories.health,
      social: colors.eventCategories.social,
    },
    opacity: {
      default: '1',
      hover: '0.9',
      disabled: '0.5',
    },
  },
  
  modal: {
    backdropColor: 'rgba(0, 0, 0, 0.5)',
    maxWidth: '640px',
    borderRadius: borderRadius.lg,
    shadow: shadows.modal,
  },
  
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
    padding: {
      sm: '8px 12px',
      md: '10px 16px',
      lg: '12px 20px',
    },
  },
} as const;

// Accessibility tokens
export const accessibility = {
  focusRing: {
    width: '2px',
    style: 'solid',
    color: colors.primary[500],
    offset: '2px',
  },
  minTouchTarget: '44px',
  contrast: {
    aa: '4.5:1',
    aaa: '7:1',
  },
} as const;

// Theme variants
export const themes = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af',
    },
    border: '#e5e7eb',
  },
  dark: {
    background: '#111827',
    surface: '#1f2937',
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      disabled: '#6b7280',
    },
    border: '#374151',
  },
} as const;

// Export utilities for type safety
export type ColorToken = keyof typeof colors.primary;
export type SpacingToken = keyof typeof spacing;
export type TypographySize = keyof typeof typography.fontSize;
export type EventCategory = keyof typeof colors.eventCategories;
export type Theme = keyof typeof themes;

// Helper functions
export const getEventColor = (category: EventCategory): string => {
  return colors.eventCategories[category] || colors.eventCategories.work;
};

export const getSpacing = (size: SpacingToken): string => {
  return spacing[size];
};

export const getFontSize = (size: TypographySize) => {
  return typography.fontSize[size];
};

// CSS Custom Properties (for runtime theme switching)
export const cssVariables = {
  '--color-primary': colors.primary[500],
  '--color-primary-hover': colors.primary[600],
  '--color-background': themes.light.background,
  '--color-surface': themes.light.surface,
  '--color-text-primary': themes.light.text.primary,
  '--color-text-secondary': themes.light.text.secondary,
  '--color-border': themes.light.border,
  '--spacing-unit': '4px',
  '--border-radius': borderRadius.default,
  '--shadow-default': shadows.default,
  '--font-family-sans': typography.fontFamily.sans.join(', '),
  '--animation-duration': animation.duration.normal,
} as const;