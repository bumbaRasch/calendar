import { colors } from './colors';

export interface Theme {
  name: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    border: {
      default: string;
      muted: string;
      focus: string;
    };
    primary: {
      main: string;
      hover: string;
      active: string;
      text: string;
      bg: string;
    };
    secondary: {
      main: string;
      hover: string;
      active: string;
      text: string;
      bg: string;
    };
    success: {
      main: string;
      hover: string;
      bg: string;
      text: string;
    };
    warning: {
      main: string;
      hover: string;
      bg: string;
      text: string;
    };
    error: {
      main: string;
      hover: string;
      bg: string;
      text: string;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  animation: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Light theme configuration
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: colors.semantic.background.light,
    surface: colors.semantic.surface.light,
    surfaceElevated: '#ffffff',
    text: {
      primary: colors.semantic.text.primary.light,
      secondary: colors.semantic.text.secondary.light,
      muted: colors.semantic.text.muted.light,
      inverse: colors.semantic.text.primary.dark,
    },
    border: {
      default: colors.semantic.border.light,
      muted: colors.secondary[200],
      focus: colors.primary[400],
    },
    primary: {
      main: colors.primary[500],
      hover: colors.primary[600],
      active: colors.primary[700],
      text: '#ffffff',
      bg: colors.primary[50],
    },
    secondary: {
      main: colors.secondary[500],
      hover: colors.secondary[600],
      active: colors.secondary[700],
      text: '#ffffff',
      bg: colors.secondary[50],
    },
    success: {
      main: colors.success[500],
      hover: colors.success[600],
      bg: colors.success[50],
      text: colors.success[700],
    },
    warning: {
      main: colors.warning[500],
      hover: colors.warning[600],
      bg: colors.warning[50],
      text: colors.warning[700],
    },
    error: {
      main: colors.error[500],
      hover: colors.error[600],
      bg: colors.error[50],
      text: colors.error[700],
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    xxl: '1.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  animation: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

// Dark theme configuration
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: colors.semantic.background.dark,
    surface: colors.semantic.surface.dark,
    surfaceElevated: colors.secondary[800],
    text: {
      primary: colors.semantic.text.primary.dark,
      secondary: colors.semantic.text.secondary.dark,
      muted: colors.semantic.text.muted.dark,
      inverse: colors.semantic.text.primary.light,
    },
    border: {
      default: colors.semantic.border.dark,
      muted: colors.secondary[700],
      focus: colors.primary[400],
    },
    primary: {
      main: colors.primary[400],
      hover: colors.primary[300],
      active: colors.primary[200],
      text: colors.secondary[900],
      bg: colors.primary[900],
    },
    secondary: {
      main: colors.secondary[400],
      hover: colors.secondary[300],
      active: colors.secondary[200],
      text: colors.secondary[900],
      bg: colors.secondary[900],
    },
    success: {
      main: colors.success[400],
      hover: colors.success[300],
      bg: colors.success[900],
      text: colors.success[300],
    },
    warning: {
      main: colors.warning[400],
      hover: colors.warning[300],
      bg: colors.warning[900],
      text: colors.warning[300],
    },
    error: {
      main: colors.error[400],
      hover: colors.error[300],
      bg: colors.error[900],
      text: colors.error[300],
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
    },
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight,
  animation: lightTheme.animation,
};

// Theme context and utilities
export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};

// CSS custom properties generator
export const generateCSSVariables = (theme: Theme): string => {
  return `
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-surface-elevated: ${theme.colors.surfaceElevated};
    
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-muted: ${theme.colors.text.muted};
    --color-text-inverse: ${theme.colors.text.inverse};
    
    --color-border-default: ${theme.colors.border.default};
    --color-border-muted: ${theme.colors.border.muted};
    --color-border-focus: ${theme.colors.border.focus};
    
    --color-primary-main: ${theme.colors.primary.main};
    --color-primary-hover: ${theme.colors.primary.hover};
    --color-primary-active: ${theme.colors.primary.active};
    --color-primary-text: ${theme.colors.primary.text};
    --color-primary-bg: ${theme.colors.primary.bg};
    
    --color-secondary-main: ${theme.colors.secondary.main};
    --color-secondary-hover: ${theme.colors.secondary.hover};
    --color-secondary-active: ${theme.colors.secondary.active};
    --color-secondary-text: ${theme.colors.secondary.text};
    --color-secondary-bg: ${theme.colors.secondary.bg};
    
    --color-success-main: ${theme.colors.success.main};
    --color-success-hover: ${theme.colors.success.hover};
    --color-success-bg: ${theme.colors.success.bg};
    --color-success-text: ${theme.colors.success.text};
    
    --color-warning-main: ${theme.colors.warning.main};
    --color-warning-hover: ${theme.colors.warning.hover};
    --color-warning-bg: ${theme.colors.warning.bg};
    --color-warning-text: ${theme.colors.warning.text};
    
    --color-error-main: ${theme.colors.error.main};
    --color-error-hover: ${theme.colors.error.hover};
    --color-error-bg: ${theme.colors.error.bg};
    --color-error-text: ${theme.colors.error.text};
    
    --shadow-sm: ${theme.colors.shadow.sm};
    --shadow-md: ${theme.colors.shadow.md};
    --shadow-lg: ${theme.colors.shadow.lg};
    --shadow-xl: ${theme.colors.shadow.xl};
    
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    --border-radius-sm: ${theme.borderRadius.sm};
    --border-radius-md: ${theme.borderRadius.md};
    --border-radius-lg: ${theme.borderRadius.lg};
    --border-radius-xl: ${theme.borderRadius.xl};
    --border-radius-full: ${theme.borderRadius.full};
    
    --font-size-xs: ${theme.fontSize.xs};
    --font-size-sm: ${theme.fontSize.sm};
    --font-size-md: ${theme.fontSize.md};
    --font-size-lg: ${theme.fontSize.lg};
    --font-size-xl: ${theme.fontSize.xl};
    --font-size-xxl: ${theme.fontSize.xxl};
    
    --font-weight-normal: ${theme.fontWeight.normal};
    --font-weight-medium: ${theme.fontWeight.medium};
    --font-weight-semibold: ${theme.fontWeight.semibold};
    --font-weight-bold: ${theme.fontWeight.bold};
    
    --animation-fast: ${theme.animation.fast};
    --animation-normal: ${theme.animation.normal};
    --animation-slow: ${theme.animation.slow};
  `;
};

// Helper function to inject CSS variables into document
export const injectThemeVariables = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const cssVars = generateCSSVariables(theme);

    // Parse and apply CSS variables
    cssVars.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('--') && trimmed.includes(':')) {
        const [property, value] = trimmed.split(':').map((s) => s.trim());
        if (property && value) {
          root.style.setProperty(property, value.replace(';', ''));
        }
      }
    });
  }
};
