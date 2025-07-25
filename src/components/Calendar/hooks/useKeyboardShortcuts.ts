import { useEffect, useCallback } from 'react';
import type { CalendarApi } from '@fullcalendar/core';

interface UseKeyboardShortcutsProps {
  calendarApi: () => CalendarApi | null;
  onViewChange: (view: string) => void;
  currentView: string;
  isEnabled?: boolean;
  onDeleteEvent?: (eventId: string) => void;
  selectedEventId?: string | null;
  onFocusSearch?: () => void;
  onClearSearch?: () => void;
  onShowHelp?: () => void;
  onCreateEvent?: () => void;
  onToggleTheme?: () => void;
  onRefresh?: () => void;
  onTrackNavigation?: () => void;
}

export const useKeyboardShortcuts = ({
  calendarApi,
  onViewChange,
  isEnabled = true,
  onDeleteEvent,
  selectedEventId,
  onFocusSearch,
  onClearSearch,
  onShowHelp,
  onCreateEvent,
  onToggleTheme,
  onRefresh,
  onTrackNavigation,
}: UseKeyboardShortcutsProps) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts when calendar is focused or no input is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      if (isInputFocused) return;

      const api = calendarApi();
      if (!api) return;

      // Handle shortcuts with or without modifier keys
      const key = event.key.toLowerCase();
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;

      // Navigation shortcuts
      if (!isCtrlOrCmd && !isShift && !isAlt) {
        switch (key) {
          case 'arrowleft':
          case 'h':
            event.preventDefault();
            api.prev();
            onTrackNavigation?.();
            break;
          case 'arrowright':
          case 'l':
            event.preventDefault();
            api.next();
            onTrackNavigation?.();
            break;
          case 't':
            event.preventDefault();
            api.today();
            onTrackNavigation?.();
            break;
          case '?':
            // Show keyboard shortcuts help dialog
            if (onShowHelp) {
              event.preventDefault();
              onShowHelp();
            }
            break;
          case 'n':
          case 'c':
            // Create new event
            if (onCreateEvent) {
              event.preventDefault();
              onCreateEvent();
            }
            break;
          case 'r':
            // Refresh calendar
            if (onRefresh) {
              event.preventDefault();
              onRefresh();
            }
            break;
          case 'j':
            // Next day (alternative to arrow right)
            event.preventDefault();
            if (api.view.type === 'dayGridMonth') {
              const currentDate = api.getDate();
              const nextDay = new Date(currentDate);
              nextDay.setDate(nextDay.getDate() + 1);
              api.gotoDate(nextDay);
            } else {
              api.next();
            }
            onTrackNavigation?.();
            break;
          case 'k':
            // Previous day (alternative to arrow left)
            event.preventDefault();
            if (api.view.type === 'dayGridMonth') {
              const currentDate = api.getDate();
              const prevDay = new Date(currentDate);
              prevDay.setDate(prevDay.getDate() - 1);
              api.gotoDate(prevDay);
            } else {
              api.prev();
            }
            onTrackNavigation?.();
            break;
          case 'escape':
            event.preventDefault();
            // Clear search or close any open dialogs or tooltips
            if (onClearSearch) {
              onClearSearch();
            }
            document.dispatchEvent(new CustomEvent('calendar:escape'));
            break;
          case 'delete':
          case 'backspace':
            // Delete selected event
            if (selectedEventId && onDeleteEvent) {
              event.preventDefault();
              onDeleteEvent(selectedEventId);
            }
            break;
        }
      }

      // View switching shortcuts (with Alt key)
      if (isAlt && !isCtrlOrCmd && !isShift) {
        switch (key) {
          case '1':
          case 'm':
            event.preventDefault();
            onViewChange('dayGridMonth');
            break;
          case '2':
          case 'w':
            event.preventDefault();
            onViewChange('timeGridWeek');
            break;
          case '3':
          case 'd':
            event.preventDefault();
            onViewChange('timeGridDay');
            break;
          case '4':
          case 'l':
            event.preventDefault();
            onViewChange('listWeek');
            break;
        }
      }

      // Advanced shortcuts (with Ctrl/Cmd)
      if (isCtrlOrCmd && !isShift && !isAlt) {
        switch (key) {
          case 'k':
            event.preventDefault();
            // Open command palette (future feature)
            break;
          case 'f':
            event.preventDefault();
            // Focus search
            if (onFocusSearch) {
              onFocusSearch();
            }
            break;
          case 'n':
            // Create new event
            if (onCreateEvent) {
              event.preventDefault();
              onCreateEvent();
            }
            break;
          case 'r':
            // Refresh calendar
            if (onRefresh) {
              event.preventDefault();
              onRefresh();
            }
            break;
          case ',':
            // Toggle theme (Ctrl/Cmd + comma for settings)
            if (onToggleTheme) {
              event.preventDefault();
              onToggleTheme();
            }
            break;
        }
      }

      // Shortcuts with Shift modifier
      if (isShift && !isCtrlOrCmd && !isAlt) {
        switch (key) {
          case '?':
            // Show keyboard shortcuts help dialog (Shift + ?)
            if (onShowHelp) {
              event.preventDefault();
              onShowHelp();
            }
            break;
        }
      }
    },
    [
      calendarApi,
      onViewChange,
      onDeleteEvent,
      selectedEventId,
      onFocusSearch,
      onClearSearch,
      onShowHelp,
      onCreateEvent,
      onToggleTheme,
      onRefresh,
      onTrackNavigation,
    ],
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, isEnabled]);

  // Return shortcut information for documentation
  return {
    shortcuts: {
      navigation: [
        { keys: ['←', 'H'], description: 'Previous period' },
        { keys: ['→', 'L'], description: 'Next period' },
        { keys: ['J'], description: 'Next day' },
        { keys: ['K'], description: 'Previous day' },
        { keys: ['T'], description: 'Go to today' },
        { keys: ['Esc'], description: 'Close dialogs' },
        { keys: ['Del', 'Backspace'], description: 'Delete selected event' },
      ],
      views: [
        { keys: ['Alt+1', 'Alt+M'], description: 'Month view' },
        { keys: ['Alt+2', 'Alt+W'], description: 'Week view' },
        { keys: ['Alt+3', 'Alt+D'], description: 'Day view' },
        { keys: ['Alt+4', 'Alt+L'], description: 'List view' },
      ],
      eventActions: [
        { keys: ['N', 'C'], description: 'Create new event' },
        { keys: ['Ctrl+N', 'Cmd+N'], description: 'Create new event' },
        { keys: ['Del', 'Backspace'], description: 'Delete selected event' },
        {
          keys: ['Ctrl+Click', 'Right Click'],
          description: 'Quick edit event',
        },
      ],
      advanced: [
        { keys: ['Ctrl+K', 'Cmd+K'], description: 'Command palette (future)' },
        { keys: ['Ctrl+F', 'Cmd+F'], description: 'Focus search' },
        { keys: ['Ctrl+R', 'Cmd+R'], description: 'Refresh calendar' },
        { keys: ['Ctrl+,', 'Cmd+,'], description: 'Toggle theme' },
        { keys: ['?', 'Shift+?'], description: 'Show keyboard shortcuts' },
        { keys: ['R'], description: 'Refresh calendar' },
        { keys: ['Esc'], description: 'Clear search' },
      ],
    },
  };
};
