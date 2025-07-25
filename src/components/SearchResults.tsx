import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { CalendarEvent } from '../types/event';
import { getCategoryColor } from '../lib/colors';
import { Badge } from './ui/badge';
import { useThemeContext } from './ThemeProvider';
import { cn } from '../lib/utils';

interface SearchResultsProps {
  results: CalendarEvent[];
  query: string;
  onEventClick: (event: CalendarEvent) => void;
  onEventFocus?: (event: CalendarEvent) => void;
  className?: string;
  isVisible?: boolean;
  maxHeight?: string;
}

interface GroupedResults {
  [dateKey: string]: {
    date: Date;
    events: CalendarEvent[];
  };
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  onEventClick,
  onEventFocus,
  className,
  isVisible = true,
  maxHeight = '400px',
}) => {
  const { theme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  // Group results by date
  const groupedResults: GroupedResults = useMemo(() => {
    const groups: GroupedResults = {};

    results.forEach((event) => {
      const date = new Date(event.start);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          events: [],
        };
      }

      groups[dateKey].events.push(event);
    });

    // Sort events within each group by start time
    Object.values(groups).forEach((group) => {
      group.events.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    });

    return groups;
  }, [results]);

  // Get sorted date keys
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedResults).sort((a, b) => {
      return (
        groupedResults[a].date.getTime() - groupedResults[b].date.getTime()
      );
    });
  }, [groupedResults]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            onEventClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedIndex(-1);
          break;
      }
    },
    [results, selectedIndex, onEventClick],
  );

  // Focus selected item when index changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const event = results[selectedIndex];
      onEventFocus?.(event);

      // Scroll selected item into view
      const selectedElement = containerRef.current?.querySelector(
        `[data-event-id="${event.id}"]`,
      ) as HTMLElement;

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex, results, onEventFocus]);

  // Format time
  const formatTime = useCallback(
    (dateString: string | Date, allDay: boolean) => {
      if (allDay) return 'All day';

      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    },
    [],
  );

  // Highlight query in text
  const highlightText = useCallback(
    (text: string, query: string) => {
      if (!query.trim()) return text;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi',
      );
      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5"
              style={{
                backgroundColor: theme.colors.warning.bg,
                color: theme.colors.warning.text,
              }}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    },
    [theme],
  );

  if (!isVisible || results.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-30',
        'overflow-hidden',
        className,
      )}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border.default,
        boxShadow: theme.colors.shadow.lg,
        maxHeight,
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="listbox"
      aria-label={`${results.length} search results`}
    >
      {/* Results header */}
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border.muted,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar
              className="h-4 w-4"
              style={{ color: theme.colors.primary.main }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: theme.colors.text.primary }}
            >
              {results.length} event{results.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {query && (
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: theme.colors.secondary.bg,
                color: theme.colors.secondary.main,
              }}
            >
              &quot;{query}&quot;
            </Badge>
          )}
        </div>
      </div>

      {/* Results list */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: `calc(${maxHeight} - 60px)` }}
      >
        {sortedDateKeys.map((dateKey) => {
          const group = groupedResults[dateKey];

          return (
            <div key={dateKey}>
              {/* Date header */}
              <div
                className="sticky top-0 px-4 py-2 text-xs font-medium border-b"
                style={{
                  backgroundColor: theme.colors.surfaceElevated + 'f0',
                  color: theme.colors.text.muted,
                  borderColor: theme.colors.border.muted,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {dateKey}
              </div>

              {/* Events for this date */}
              {group.events.map((event) => {
                const globalIndex = results.indexOf(event);
                const isSelected = selectedIndex === globalIndex;
                const categoryColor = getCategoryColor(
                  event.category,
                  theme.name === 'dark',
                );

                return (
                  <button
                    key={event.id}
                    data-event-id={event.id}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-all duration-150',
                      'hover:bg-opacity-5 focus:bg-opacity-10 focus:outline-none',
                      'border-l-4 border-transparent',
                      isSelected && 'bg-opacity-10 border-l-blue-500',
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? theme.colors.primary.main + '10'
                        : 'transparent',
                      borderLeftColor: isSelected
                        ? theme.colors.primary.main
                        : 'transparent',
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Event title */}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: categoryColor }}
                            aria-hidden="true"
                          />
                          <h3
                            className="font-medium text-sm truncate"
                            style={{ color: theme.colors.text.primary }}
                          >
                            {highlightText(event.title, query)}
                          </h3>

                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 ml-auto flex-shrink-0"
                            style={{
                              backgroundColor: categoryColor + '20',
                              borderColor: categoryColor,
                              color: categoryColor,
                            }}
                          >
                            {event.category}
                          </Badge>
                        </div>

                        {/* Event details */}
                        <div className="space-y-1">
                          {/* Time */}
                          <div
                            className="flex items-center gap-1 text-xs"
                            style={{ color: theme.colors.text.muted }}
                          >
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {formatTime(event.start, event.allDay || false)}
                              {event.end && !event.allDay && (
                                <>
                                  {' '}
                                  -{' '}
                                  {formatTime(event.end, event.allDay || false)}
                                </>
                              )}
                            </span>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: theme.colors.text.muted }}
                            >
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {highlightText(event.location, query)}
                              </span>
                            </div>
                          )}

                          {/* Attendees */}
                          {event.attendees && event.attendees.length > 0 && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: theme.colors.text.muted }}
                            >
                              <Users className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {event.attendees.length} attendee
                                {event.attendees.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {/* Description preview */}
                          {event.description && (
                            <div
                              className="text-xs line-clamp-2 mt-1"
                              style={{ color: theme.colors.text.muted }}
                            >
                              {highlightText(
                                event.description.slice(0, 100),
                                query,
                              )}
                              {event.description.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action indicators */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {event.url && (
                          <ExternalLink
                            className="h-3 w-3"
                            style={{ color: theme.colors.text.muted }}
                            aria-label="Has link"
                          />
                        )}

                        <ChevronRight
                          className="h-4 w-4 transition-transform duration-150"
                          style={{
                            color: theme.colors.text.muted,
                            transform: isSelected
                              ? 'translateX(2px)'
                              : 'translateX(0)',
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer with keyboard hints */}
      <div
        className="px-4 py-2 border-t text-xs"
        style={{
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border.muted,
          color: theme.colors.text.muted,
        }}
      >
        <div className="flex items-center justify-between">
          <span>Use ↑↓ to navigate, Enter to select</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
