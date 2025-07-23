/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Design System Colors (2025)
      colors: {
        // Primary Calendar Brand
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Secondary Colors
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
        },

        // Calendar-specific colors
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
        event: {
          work: '#3b82f6',
          personal: '#10b981',
          meeting: '#f59e0b',
          holiday: '#ef4444',
          deadline: '#8b5cf6',
          travel: '#06b6d4',
          health: '#84cc16',
          social: '#ec4899',
        },

        // Status Colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },

      // Typography Scale
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
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

      // Spacing Scale
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },

      // Box Shadow
      boxShadow: {
        calendar:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        event: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        modal:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        floating:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      // Animation & Transitions
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        shimmer: 'shimmer 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-4px)',
          },
          '60%': {
            transform: 'translateY(-2px)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      },

      // Transition Duration
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },

      // Z-Index Scale
      zIndex: {
        dropdown: '1000',
        modal: '1050',
        tooltip: '1070',
        notification: '1080',
      },

      // Container Queries (Modern CSS)
      screens: {
        xs: '475px',
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
      },

      // Grid Templates
      gridTemplateColumns: {
        calendar: 'repeat(7, minmax(0, 1fr))',
        sidebar: '280px 1fr',
        dashboard: 'repeat(auto-fit, minmax(300px, 1fr))',
      },

      // Aspect Ratios
      aspectRatio: {
        calendar: '7 / 5',
        'event-card': '16 / 9',
      },
    },
  },
  plugins: [
    // Custom plugin for calendar-specific utilities
    function ({ addUtilities, theme }) {
      const calendarUtilities = {
        '.calendar-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '1px',
          backgroundColor: theme('colors.gray.200'),
        },
        '.calendar-cell': {
          backgroundColor: theme('colors.white'),
          minHeight: '120px',
          padding: theme('spacing.2'),
          position: 'relative',
        },
        '.event-dot': {
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          display: 'inline-block',
          marginRight: theme('spacing.2'),
        },
        '.glass-morphism': {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.shimmer-bg': {
          background: `linear-gradient(90deg, 
            ${theme('colors.gray.200')} 25%, 
            ${theme('colors.gray.100')} 50%, 
            ${theme('colors.gray.200')} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        },
      };

      addUtilities(calendarUtilities);
    },
  ],

  // Dark mode support
  darkMode: 'class',

  // Modern CSS features
  future: {
    hoverOnlyWhenSupported: true,
  },

  // Performance optimizations
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
