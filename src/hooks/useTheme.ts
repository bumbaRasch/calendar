import { useEffect, useState } from 'react';
import { getTheme, injectThemeVariables, type Theme } from '../lib/theme';

export interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  // Initialize from localStorage or system preference
  const [isDark, setIsDarkState] = useState(() => {
    if (typeof window === 'undefined') return false;

    const stored = localStorage.getItem('theme-mode');
    if (stored) {
      return stored === 'dark';
    }

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Get current theme based on isDark state
  const theme = getTheme(isDark);

  // Update localStorage and apply theme variables when isDark changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');

    // Apply theme class to document
    document.documentElement.classList.toggle('dark', isDark);

    // Inject CSS variables
    injectThemeVariables(theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background);
    }
  }, [isDark, theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem('theme-mode');
      if (!stored) {
        setIsDarkState(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const setIsDark = (newIsDark: boolean) => {
    setIsDarkState(newIsDark);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return {
    theme,
    isDark,
    setIsDark,
    toggleTheme,
  };
};
