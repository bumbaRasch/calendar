import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import type { CalendarApi } from '@fullcalendar/core';

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ThemeToggle';
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
  theme: 'light' | 'dark';
  isMobile: boolean;
  enableAnimations?: boolean;
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
}) => {
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
        'p-4 border-b border-gray-200 dark:border-gray-700',
        'bg-gray-50/50 dark:bg-gray-800/50',
        enableAnimations && 'transition-colors duration-200',
      )}
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
              'hover:bg-primary-50 hover:border-primary-200',
              'dark:hover:bg-primary-900/20 dark:hover:border-primary-800',
              enableAnimations && 'transition-all duration-200',
            )}
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
              'hover:bg-primary-50 hover:border-primary-200',
              'dark:hover:bg-primary-900/20 dark:hover:border-primary-800',
              enableAnimations && 'transition-all duration-200',
            )}
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
              'hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700',
              'dark:hover:bg-primary-900/20 dark:hover:border-primary-800',
              'dark:hover:text-primary-300',
              enableAnimations && 'transition-all duration-200',
            )}
          >
            Today
          </Button>
        </div>

        {/* Current Period Title */}
        <div className="flex items-center gap-2 ml-4">
          <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatTitle(title)}
          </h2>
          {currentDate && (
            <Badge
              variant="secondary"
              className="text-xs font-normal hidden sm:inline-flex"
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

      {/* Right Section - View Switcher & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div
          className={cn(
            'inline-flex items-center rounded-lg',
            'border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-gray-800 p-1 shadow-sm',
            enableAnimations && 'transition-all duration-200',
          )}
        >
          {viewButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleViewChange(button.key)}
              className={cn(
                'relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
                'text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2',
                'dark:focus:ring-primary-800 dark:focus:ring-offset-gray-900',
                actualCurrentView === button.key
                  ? [
                      'bg-blue-600 text-white shadow-md font-semibold',
                      'dark:bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-400',
                      enableAnimations && 'transform scale-[1.02]',
                    ]
                  : [
                      'text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      'hover:text-gray-900 dark:hover:text-gray-100',
                    ],
              )}
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
                <div className="absolute inset-0 rounded-md bg-white/20 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle
          size={isMobile ? 'sm' : 'md'}
          variant="outline"
          className="border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
};
