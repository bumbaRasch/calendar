// Modern color palette for calendar application
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary accent colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Event category colors
  categories: {
    meeting: {
      light: '#3b82f6',
      dark: '#60a5fa',
      bg: '#eff6ff',
      darkBg: '#1e3a8a20',
    },
    personal: {
      light: '#10b981',
      dark: '#34d399',
      bg: '#f0fdfa',
      darkBg: '#065f4620',
    },
    work: {
      light: '#f59e0b',
      dark: '#fbbf24',
      bg: '#fffbeb',
      darkBg: '#78350f20',
    },
    reminder: {
      light: '#8b5cf6',
      dark: '#a78bfa',
      bg: '#f5f3ff',
      darkBg: '#581c8720',
    },
    deadline: {
      light: '#ef4444',
      dark: '#f87171',
      bg: '#fef2f2',
      darkBg: '#7f1d1d20',
    },
    other: {
      light: '#64748b',
      dark: '#94a3b8',
      bg: '#f8fafc',
      darkBg: '#0f172a20',
    },
  },

  // Event priority colors
  priorities: {
    low: {
      light: '#64748b',
      dark: '#94a3b8',
    },
    medium: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    high: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },

  // Calendar specific colors
  calendar: {
    today: {
      light: '#fef3c7',
      dark: '#78350f20',
      border: '#f59e0b',
    },
    weekend: {
      light: '#f8fafc',
      dark: '#0f172a',
    },
    otherMonth: {
      light: '#9ca3af',
      dark: '#6b7280',
    },
    selected: {
      light: '#dbeafe',
      dark: '#1e40af20',
      border: '#3b82f6',
    },
    hover: {
      light: '#f1f5f9',
      dark: '#1e293b',
    },
  },

  // Semantic colors for dark/light modes
  semantic: {
    background: {
      light: '#ffffff',
      dark: '#0f172a',
    },
    surface: {
      light: '#f8fafc',
      dark: '#1e293b',
    },
    text: {
      primary: {
        light: '#0f172a',
        dark: '#f8fafc',
      },
      secondary: {
        light: '#64748b',
        dark: '#94a3b8',
      },
      muted: {
        light: '#94a3b8',
        dark: '#64748b',
      },
    },
    border: {
      light: '#e2e8f0',
      dark: '#334155',
    },
  },
} as const;

// Helper function to get category color
export const getCategoryColor = (
  category: string,
  isDark = false,
  variant: 'light' | 'dark' | 'bg' | 'darkBg' = 'light',
) => {
  const categoryKey = category.toLowerCase() as keyof typeof colors.categories;
  const categoryColors =
    colors.categories[categoryKey] || colors.categories.other;

  if (isDark && variant === 'bg') {
    return categoryColors.darkBg;
  }

  if (isDark) {
    return categoryColors.dark;
  }

  if (variant === 'bg') {
    return categoryColors.bg;
  }

  return categoryColors.light;
};

// Helper function to get priority color
export const getPriorityColor = (priority: string, isDark = false) => {
  const priorityKey = priority.toLowerCase() as keyof typeof colors.priorities;
  const priorityColors =
    colors.priorities[priorityKey] || colors.priorities.medium;

  return isDark ? priorityColors.dark : priorityColors.light;
};

// Helper function to get semantic color
export const getSemanticColor = (colorPath: string, isDark = false) => {
  const keys = colorPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let color: any = colors.semantic;

  for (const key of keys) {
    color = color[key];
    if (!color) return isDark ? '#f8fafc' : '#0f172a';
  }

  if (typeof color === 'object' && color.light && color.dark) {
    return isDark ? color.dark : color.light;
  }

  return color;
};
