import { useEffect, useCallback } from 'react';
import type { CalendarApi } from '@fullcalendar/core';

interface UseKeyboardShortcutsProps {
  calendarApi: () => CalendarApi | null;
  onViewChange: (view: string) => void;
  currentView: string;
  isEnabled?: boolean;
  onDeleteEvent?: (eventId: string) => void;
  selectedEventId?: string | null;
}

export const useKeyboardShortcuts = ({
  calendarApi,
  onViewChange,
  isEnabled = true,
  onDeleteEvent,
  selectedEventId,
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
            break;
          case 'arrowright':
          case 'l':
            event.preventDefault();
            api.next();
            break;
          case 't':
            event.preventDefault();
            api.today();
            break;
          case 'escape':
            event.preventDefault();
            // Close any open dialogs or tooltips
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
            // Open search (future feature)
            break;
        }
      }
    },
    [calendarApi, onViewChange, onDeleteEvent, selectedEventId],
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
      advanced: [
        { keys: ['Ctrl+K', 'Cmd+K'], description: 'Command palette (future)' },
        { keys: ['Ctrl+F', 'Cmd+F'], description: 'Search (future)' },
      ],
    },
  };
};
