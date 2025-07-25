import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useThemeContext } from '../ThemeProvider';
import { cn } from '../../lib/utils';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  condition?: () => boolean;
}

interface KeyboardShortcutsOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
  context?: 'calendar' | 'search' | 'event' | 'navigation';
  className?: string;
}

// Context-specific shortcuts
const contextShortcuts: Record<string, KeyboardShortcut[]> = {
  calendar: [
    { keys: ['N', 'C'], description: 'Create new event' },
    { keys: ['T'], description: 'Go to today' },
    { keys: ['←', '→'], description: 'Navigate periods' },
    { keys: ['Alt+1-4'], description: 'Switch views' },
  ],
  search: [
    { keys: ['↑', '↓'], description: 'Navigate results' },
    { keys: ['Enter'], description: 'Select result' },
    { keys: ['Esc'], description: 'Clear search' },
  ],
  event: [
    { keys: ['Del'], description: 'Delete event' },
    { keys: ['Ctrl+Click'], description: 'Quick edit' },
    { keys: ['Esc'], description: 'Close dialog' },
  ],
  navigation: [
    { keys: ['H', 'L'], description: 'Navigate periods' },
    { keys: ['J', 'K'], description: 'Navigate days' },
    { keys: ['T'], description: 'Go to today' },
  ],
};

export const KeyboardShortcutsOverlay: React.FC<
  KeyboardShortcutsOverlayProps
> = ({ isVisible, onDismiss, context = 'calendar', className }) => {
  const { theme } = useThemeContext();
  const [animationState, setAnimationState] = useState<
    'entering' | 'visible' | 'exiting'
  >('entering');

  // Handle animation states
  useEffect(() => {
    if (isVisible) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('visible'), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
    }
  }, [isVisible]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    },
    [onDismiss],
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleKeyDown]);

  if (!isVisible && animationState !== 'exiting') return null;

  const shortcuts = contextShortcuts[context] || contextShortcuts.calendar;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40 max-w-sm',
        'transition-all duration-300 ease-in-out',
        animationState === 'entering' && 'opacity-0 translate-y-4 scale-95',
        animationState === 'visible' && 'opacity-100 translate-y-0 scale-100',
        animationState === 'exiting' && 'opacity-0 translate-y-4 scale-95',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-lg shadow-xl border backdrop-blur-sm',
          'p-4 space-y-3',
        )}
        style={{
          backgroundColor: theme.colors.surface + 'f0',
          borderColor: theme.colors.border.default,
          boxShadow: theme.colors.shadow.xl,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-md"
              style={{ backgroundColor: theme.colors.primary.main + '20' }}
            >
              <Keyboard
                className="h-4 w-4"
                style={{ color: theme.colors.primary.main }}
              />
            </div>
            <div>
              <h3
                className="text-sm font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                Quick Shortcuts
              </h3>
              <p className="text-xs" style={{ color: theme.colors.text.muted }}>
                {context.charAt(0).toUpperCase() + context.slice(1)} shortcuts
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100"
            style={{ color: theme.colors.text.muted }}
            aria-label="Dismiss shortcuts overlay"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2">
          {shortcuts.slice(0, 4).map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span
                className="text-xs"
                style={{ color: theme.colors.text.primary }}
              >
                {shortcut.description}
              </span>

              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 text-xs font-mono',
                      'rounded border shadow-sm min-w-[1.5rem] justify-center',
                    )}
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border.default,
                      color: theme.colors.text.primary,
                      fontSize: '10px',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-xs" style={{ color: theme.colors.text.muted }}>
            Press{' '}
            <kbd className="px-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
              ?
            </kbd>{' '}
            for all shortcuts
          </span>

          <Badge
            variant="secondary"
            className="text-xs px-2 py-0.5"
            style={{
              backgroundColor: theme.colors.secondary.bg,
              color: theme.colors.secondary.main,
              fontSize: '10px',
            }}
          >
            Auto-hide in 8s
          </Badge>
        </div>
      </div>
    </div>
  );
};
