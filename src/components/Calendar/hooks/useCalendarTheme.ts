import { useMemo } from 'react';

export interface CalendarTheme {
  calendar: string;
  toolbar: string;
  content: string;
  event: string;
}

export const useCalendarTheme = (isDarkMode: boolean = false) => {
  const theme = isDarkMode ? 'dark' : 'light';

  const themeClasses: CalendarTheme = useMemo(() => {
    if (isDarkMode) {
      return {
        calendar: 'bg-gray-900 border-gray-700',
        toolbar: 'bg-gray-800/50 text-gray-100 border-gray-700',
        content: 'text-gray-100',
        event: 'shadow-lg',
      };
    }

    return {
      calendar: 'bg-white border-gray-200',
      toolbar: 'bg-gray-50/50 text-gray-900 border-gray-200',
      content: 'text-gray-900',
      event: 'shadow-sm',
    };
  }, [isDarkMode]);

  return {
    theme,
    themeClasses,
    isDarkMode,
  };
};
