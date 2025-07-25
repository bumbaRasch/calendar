import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Printer,
} from 'lucide-react';
import type { CalendarApi } from '@fullcalendar/core';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ThemeToggle';
import { SearchBar, type SearchFilters } from '../SearchBar';
import { useThemeContext } from '../ThemeProvider';
import { cn } from '../../lib/utils';

type CalendarView =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';

interface CalendarToolbarProps {
  calendarApi: () => CalendarApi | null;
  currentView: string;
  onViewChange: (view: CalendarView) => void;
  isMobile: boolean;
  enableAnimations?: boolean;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  onPrint?: () => void;
}

const viewButtons = [
  { key: 'dayGridMonth', label: 'Month', icon: '📅', shortLabel: 'M' },
  { key: 'timeGridWeek', label: 'Week', icon: '📊', shortLabel: 'W' },
  { key: 'timeGridDay', label: 'Day', icon: '📋', shortLabel: 'D' },
  { key: 'listWeek', label: 'List', icon: '📝', shortLabel: 'L' },
] as const;

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  calendarApi,
  currentView,
  onViewChange,
  isMobile,
  enableAnimations = true,
  onSearch,
  onPrint,
}) => {
  const { theme } = useThemeContext();
  const api = calendarApi();
  const currentDate = api?.getDate();
  const title = api?.view.title || '';
  const actualCurrentView = api?.view.type || currentView;

  const handlePrev = () => api?.prev();
  const handleNext = () => api?.next();
  const handleToday = () => api?.today();

  const handleViewChange = (viewName: CalendarView) => {
    api?.changeView(viewName);
    onViewChange(viewName);
  };

  const formatTitle = (title: string) =>
    isMobile && title.length > 20
      ? title.split(' ').slice(0, 2).join(' ')
      : title;

  return (
    <div
      className={cn(
        'calendar-toolbar flex flex-col sm:flex-row',
        'items-start sm:items-center justify-between',
        'p-4 border-b',
        enableAnimations && 'transition-all duration-200',
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border.default,
        boxShadow: theme.colors.shadow.sm,
      }}
    >
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-2 mb-3 sm:mb-0">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className={cn(
              'h-8 w-8 p-0',
              enableAnimations && 'transition-all duration-200 hover:scale-105',
            )}
            style={{
              borderColor: theme.colors.border.default,
              color: theme.colors.text.primary,
            }}
            aria-label="Previous period"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className={cn(
              'h-8 w-8 p-0',
              enableAnimations && 'transition-all duration-200 hover:scale-105',
            )}
            style={{
              borderColor: theme.colors.border.default,
              color: theme.colors.text.primary,
            }}
            aria-label="Next period"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className={cn(
              'px-3 h-8 text-xs font-medium',
              enableAnimations && 'transition-all duration-200 hover:scale-105',
            )}
            style={{
              borderColor: theme.colors.border.default,
              color: theme.colors.text.primary,
            }}
          >
            Today
          </Button>
        </div>

        {/* Current Period Title */}
        <div className="flex items-center gap-2 ml-4">
          <CalendarIcon
            className="h-4 w-4 transition-colors duration-200"
            style={{ color: theme.colors.text.muted }}
          />
          <h2
            className="text-lg font-semibold transition-colors duration-200"
            style={{ color: theme.colors.text.primary }}
          >
            {formatTitle(title)}
          </h2>
          {currentDate && (
            <Badge
              variant="secondary"
              className="text-xs font-normal hidden sm:inline-flex transition-all duration-200"
              style={{
                backgroundColor: theme.colors.secondary.bg,
                color: theme.colors.secondary.main,
                borderColor: theme.colors.border.muted,
              }}
            >
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Badge>
          )}
        </div>
      </div>

      {/* Search Bar - Mobile: Full width, Desktop: Inline */}
      {isMobile ? (
        <div className="w-full mt-3">
          {onSearch && (
            <SearchBar onSearch={onSearch} className="w-full search-bar" />
          )}
        </div>
      ) : (
        onSearch && (
          <SearchBar onSearch={onSearch} className="w-64 search-bar" />
        )
      )}

      {/* Right Section - View Switcher & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div
          className={cn(
            'inline-flex items-center rounded-lg p-1',
            enableAnimations && 'transition-all duration-200',
          )}
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            border: `1px solid ${theme.colors.border.default}`,
            boxShadow: theme.colors.shadow.sm,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          {viewButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleViewChange(button.key)}
              className={cn(
                'relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
                'text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:scale-105',
                actualCurrentView === button.key
                  ? 'font-semibold shadow-md'
                  : 'hover:shadow-sm',
              )}
              style={{
                backgroundColor:
                  actualCurrentView === button.key
                    ? theme.colors.primary.main
                    : 'transparent',
                color:
                  actualCurrentView === button.key
                    ? theme.colors.primary.text
                    : theme.colors.text.primary,
                borderRadius: theme.borderRadius.md,
              }}
              aria-label={`Switch to ${button.label} view`}
              aria-pressed={actualCurrentView === button.key}
            >
              <span className="text-sm" aria-hidden="true">
                {button.icon}
              </span>
              <span className={isMobile ? 'hidden xs:inline' : 'inline'}>
                {isMobile ? button.shortLabel : button.label}
              </span>
              {actualCurrentView === button.key && enableAnimations && (
                <div
                  className="absolute inset-0 rounded-md animate-pulse"
                  style={{
                    backgroundColor: theme.colors.primary.text + '20',
                    borderRadius: theme.borderRadius.md,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Print Button */}
        {onPrint && (
          <Button
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            onClick={onPrint}
            className={cn(
              'flex items-center gap-2',
              enableAnimations && 'transition-all duration-200 hover:scale-105',
            )}
            style={{
              borderColor: theme.colors.border.default,
              color: theme.colors.text.primary,
            }}
            aria-label="Print calendar"
          >
            <Printer className="h-4 w-4" />
            {!isMobile && <span>Print</span>}
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle
          size={isMobile ? 'sm' : 'md'}
          variant="outline"
          className="transition-all duration-200 hover:scale-105"
        />
      </div>
    </div>
  );
};
