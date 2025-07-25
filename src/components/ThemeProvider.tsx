import React, {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { useTheme, type UseThemeReturn } from '../hooks/useTheme';
import { injectKeyframes } from '../lib/animations';

// Create theme context
const ThemeContext = createContext<UseThemeReturn | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeValue = useTheme();

  // Inject animation keyframes when provider mounts
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div
        className="theme-root min-h-screen transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useThemeContext = (): UseThemeReturn => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Higher-order component for theme-aware components
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: UseThemeReturn }>,
) => {
  const WrappedComponent = (props: P) => {
    const theme = useThemeContext();
    return <Component {...props} theme={theme} />;
  };

  WrappedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
