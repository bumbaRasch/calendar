import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useUIStore } from '../stores/useUIStore';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'secondary';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'ghost',
}) => {
  const { isDarkMode, toggleDarkMode } = useUIStore();

  const handleToggle = () => {
    toggleDarkMode();

    // Apply theme to document
    const root = document.documentElement;
    if (!isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      className={cn(
        sizeClasses[size],
        'relative overflow-hidden transition-all duration-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800',
        className,
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun Icon */}
      <SunIcon
        className={cn(
          iconSizes[size],
          'absolute transition-all duration-300 ease-in-out',
          isDarkMode
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100',
        )}
      />

      {/* Moon Icon */}
      <MoonIcon
        className={cn(
          iconSizes[size],
          'absolute transition-all duration-300 ease-in-out',
          isDarkMode
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0',
        )}
      />

      <span className="sr-only">
        {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  );
};
