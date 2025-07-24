import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DateSelectArg } from '@fullcalendar/core';

interface UIState {
  // Dialog/Modal states
  isEventDialogOpen: boolean;
  setEventDialogOpen: (open: boolean) => void;

  // Selected event for editing
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Selected date info for new event creation
  selectedDateInfo: DateSelectArg | null;
  setSelectedDateInfo: (dateInfo: DateSelectArg | null) => void;

  // Calendar view state
  calendarView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  setCalendarView: (
    view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek',
  ) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error states
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Theme/appearance
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Dialog/Modal states
      isEventDialogOpen: false,
      setEventDialogOpen: (open) => set({ isEventDialogOpen: open }),

      // Selected event
      selectedEventId: null,
      setSelectedEventId: (id) => set({ selectedEventId: id }),

      // Selected date info
      selectedDateInfo: null,
      setSelectedDateInfo: (dateInfo) => set({ selectedDateInfo: dateInfo }),

      // Calendar view
      calendarView:
        typeof window !== 'undefined'
          ? (localStorage.getItem('calendar-view') as
              | 'dayGridMonth'
              | 'timeGridWeek'
              | 'timeGridDay'
              | 'listWeek') || 'dayGridMonth'
          : 'dayGridMonth',
      setCalendarView: (view) => set({ calendarView: view }),

      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error states
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Theme
      isDarkMode:
        typeof window !== 'undefined'
          ? localStorage.getItem('isDarkMode') === 'true' ||
            (!localStorage.getItem('isDarkMode') &&
              window.matchMedia('(prefers-color-scheme: dark)').matches)
          : false,
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          if (typeof window !== 'undefined') {
            localStorage.setItem('isDarkMode', newDarkMode.toString());
          }
          return { isDarkMode: newDarkMode };
        }),
    }),
    {
      name: 'ui-store',
    },
  ),
);
