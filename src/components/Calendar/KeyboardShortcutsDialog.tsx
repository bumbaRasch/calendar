import React, { useEffect, useCallback } from 'react';
import {
  X,
  Keyboard,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useThemeContext } from '../ThemeProvider';
import { cn } from '../../lib/utils';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
    category?: 'navigation' | 'views' | 'advanced' | 'search';
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      {
        keys: ['←', 'H'],
        description: 'Previous period',
        category: 'navigation',
      },
      { keys: ['→', 'L'], description: 'Next period', category: 'navigation' },
      { keys: ['J'], description: 'Next day', category: 'navigation' },
      { keys: ['K'], description: 'Previous day', category: 'navigation' },
      { keys: ['T'], description: 'Go to today', category: 'navigation' },
      {
        keys: ['Esc'],
        description: 'Close dialogs / Clear search',
        category: 'navigation',
      },
    ],
  },
  {
    title: 'View Switching',
    shortcuts: [
      {
        keys: ['Alt+1', 'Alt+M'],
        description: 'Month view',
        category: 'views',
      },
      { keys: ['Alt+2', 'Alt+W'], description: 'Week view', category: 'views' },
      { keys: ['Alt+3', 'Alt+D'], description: 'Day view', category: 'views' },
      { keys: ['Alt+4', 'Alt+L'], description: 'List view', category: 'views' },
    ],
  },
  {
    title: 'Event Management',
    shortcuts: [
      {
        keys: ['N', 'C'],
        description: 'Create new event',
        category: 'advanced',
      },
      {
        keys: ['Ctrl+N', 'Cmd+N'],
        description: 'Create new event',
        category: 'advanced',
      },
      {
        keys: ['Del', 'Backspace'],
        description: 'Delete selected event',
        category: 'advanced',
      },
      {
        keys: ['Ctrl+Click', 'Right Click'],
        description: 'Quick edit event',
        category: 'advanced',
      },
    ],
  },
  {
    title: 'Search & Advanced',
    shortcuts: [
      {
        keys: ['Ctrl+F', 'Cmd+F'],
        description: 'Focus search',
        category: 'search',
      },
      {
        keys: ['Ctrl+K', 'Cmd+K'],
        description: 'Command palette (coming soon)',
        category: 'advanced',
      },
      {
        keys: ['Ctrl+R', 'Cmd+R'],
        description: 'Refresh calendar',
        category: 'advanced',
      },
      { keys: ['R'], description: 'Refresh calendar', category: 'advanced' },
      {
        keys: ['Ctrl+,', 'Cmd+,'],
        description: 'Toggle theme',
        category: 'advanced',
      },
      {
        keys: ['?', 'Shift+?'],
        description: 'Show keyboard shortcuts',
        category: 'advanced',
      },
    ],
  },
  {
    title: 'Search Navigation',
    shortcuts: [
      {
        keys: ['↑', '↓'],
        description: 'Navigate search results / history',
        category: 'search',
      },
      {
        keys: ['Enter'],
        description: 'Select search result',
        category: 'search',
      },
      {
        keys: ['Esc'],
        description: 'Close search / Clear filters',
        category: 'search',
      },
    ],
  },
];

const getCategoryColor = (category: string, isDark: boolean) => {
  const colors = {
    navigation: isDark ? '#3B82F6' : '#2563EB', // Blue
    views: isDark ? '#10B981' : '#059669', // Green
    advanced: isDark ? '#F59E0B' : '#D97706', // Amber
    search: isDark ? '#8B5CF6' : '#7C3AED', // Purple
  };
  return (
    colors[category as keyof typeof colors] || (isDark ? '#6B7280' : '#4B5563')
  );
};

export const KeyboardShortcutsDialog: React.FC<
  KeyboardShortcutsDialogProps
> = ({ isOpen, onClose }) => {
  const { theme } = useThemeContext();

  // Handle escape key to close dialog
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
      role="button"
      aria-label="Close dialog"
      tabIndex={0}
    >
      <div
        className={cn(
          'relative w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl',
          'overflow-hidden',
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border.default,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border.muted,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: theme.colors.primary.main + '20' }}
            >
              <Keyboard
                className="h-6 w-6"
                style={{ color: theme.colors.primary.main }}
              />
            </div>
            <div>
              <h2
                id="shortcuts-dialog-title"
                className="text-xl font-semibold"
                style={{ color: theme.colors.text.primary }}
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-sm" style={{ color: theme.colors.text.muted }}>
                Master your calendar with these keyboard shortcuts
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
            style={{ color: theme.colors.text.muted }}
            aria-label="Close keyboard shortcuts dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: 'calc(90vh - 120px)' }}
          role="document"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3
                  className="text-lg font-medium flex items-center gap-2"
                  style={{ color: theme.colors.text.primary }}
                >
                  {group.title}
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: theme.colors.secondary.bg,
                      color: theme.colors.secondary.main,
                    }}
                  >
                    {group.shortcuts.length}
                  </Badge>
                </h3>

                <div className="space-y-3">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        'transition-colors duration-200 hover:bg-opacity-5',
                      )}
                      style={{
                        backgroundColor: theme.colors.surfaceElevated + '40',
                        borderLeft: `3px solid ${getCategoryColor(shortcut.category || 'navigation', theme.name === 'dark')}`,
                      }}
                    >
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {shortcut.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span
                                className="text-xs px-1"
                                style={{ color: theme.colors.text.muted }}
                              >
                                or
                              </span>
                            )}
                            <kbd
                              className={cn(
                                'inline-flex items-center px-2 py-1 text-xs font-mono',
                                'rounded border shadow-sm min-w-[2rem] justify-center',
                              )}
                              style={{
                                backgroundColor: theme.colors.background,
                                borderColor: theme.colors.border.default,
                                color: theme.colors.text.primary,
                                boxShadow: `0 1px 2px ${theme.colors.shadow.sm}`,
                              }}
                            >
                              {key === '←' && <ArrowLeft className="h-3 w-3" />}
                              {key === '→' && (
                                <ArrowRight className="h-3 w-3" />
                              )}
                              {key === '↑' && <ArrowUp className="h-3 w-3" />}
                              {key === '↓' && <ArrowDown className="h-3 w-3" />}
                              {!['←', '→', '↑', '↓'].includes(key) && key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips Section */}
          <div
            className="mt-8 pt-6 border-t"
            style={{ borderColor: theme.colors.border.muted }}
          >
            <h3
              className="text-lg font-medium mb-4 flex items-center gap-2"
              style={{ color: theme.colors.text.primary }}
            >
              💡 Pro Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.surfaceElevated }}
              >
                <p style={{ color: theme.colors.text.primary }}>
                  <strong>Quick Navigation:</strong> Use H/L keys for faster
                  navigation than arrow keys
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.surfaceElevated }}
              >
                <p style={{ color: theme.colors.text.primary }}>
                  <strong>Search Power:</strong> Use Ctrl+F to quickly find any
                  event
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.surfaceElevated }}
              >
                <p style={{ color: theme.colors.text.primary }}>
                  <strong>Quick Edit:</strong> Right-click or Ctrl+click events
                  for instant editing
                </p>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: theme.colors.surfaceElevated }}
              >
                <p style={{ color: theme.colors.text.primary }}>
                  <strong>View Switching:</strong> Alt+1-4 for lightning-fast
                  view changes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border.muted,
          }}
        >
          <p className="text-sm" style={{ color: theme.colors.text.muted }}>
            Press{' '}
            <kbd className="px-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
              ?
            </kbd>{' '}
            anytime to view shortcuts
          </p>

          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <span>Close</span>
            <kbd className="px-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded">
              Esc
            </kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};
