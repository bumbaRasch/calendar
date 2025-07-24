import React from 'react';
import {
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import type { EventContentArg } from '@fullcalendar/core';

import { cn } from '../../lib/utils';
import { EventCategory, EventPriority } from '../../types/event';

interface CustomEventContentProps {
  eventInfo: EventContentArg;
}

const categoryStyles = {
  [EventCategory.WORK]: {
    bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    text: 'text-white',
    border: 'border-blue-600',
    dot: 'bg-blue-400',
  },
  [EventCategory.PERSONAL]: {
    bg: 'bg-gradient-to-r from-green-500 to-green-600',
    text: 'text-white',
    border: 'border-green-600',
    dot: 'bg-green-400',
  },
  [EventCategory.MEETING]: {
    bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    text: 'text-white',
    border: 'border-amber-600',
    dot: 'bg-amber-400',
  },
  [EventCategory.HEALTH]: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    text: 'text-white',
    border: 'border-emerald-600',
    dot: 'bg-emerald-400',
  },
  [EventCategory.TRAVEL]: {
    bg: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    text: 'text-white',
    border: 'border-cyan-600',
    dot: 'bg-cyan-400',
  },
  [EventCategory.SOCIAL]: {
    bg: 'bg-gradient-to-r from-pink-500 to-pink-600',
    text: 'text-white',
    border: 'border-pink-600',
    dot: 'bg-pink-400',
  },
  [EventCategory.EDUCATION]: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    text: 'text-white',
    border: 'border-purple-600',
    dot: 'bg-purple-400',
  },
  [EventCategory.OTHER]: {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
    text: 'text-white',
    border: 'border-gray-600',
    dot: 'bg-gray-400',
  },
};

const priorityIcons = {
  [EventPriority.LOW]: null,
  [EventPriority.MEDIUM]: null,
  [EventPriority.HIGH]: <ClockIcon className="w-3 h-3" />,
  [EventPriority.URGENT]: <AlertTriangleIcon className="w-3 h-3" />,
};

export const CustomEventContent: React.FC<CustomEventContentProps> = ({
  eventInfo,
}) => {
  const { event, timeText, view } = eventInfo;
  const category = event.extendedProps.category as EventCategory;
  const priority = event.extendedProps.priority as EventPriority;
  const location = event.extendedProps.location;
  const attendees = event.extendedProps.attendees;

  const categoryStyle =
    categoryStyles[category] || categoryStyles[EventCategory.OTHER];
  const priorityIcon = priorityIcons[priority];
  const viewType = view.type;
  const isListView = viewType === 'listWeek';
  const isDayGrid = viewType.includes('dayGrid');
  const isTimeGrid = viewType.includes('timeGrid');

  // List view rendering
  if (isListView) {
    return (
      <div className="flex items-center gap-3 py-1 px-2 w-full group">
        {/* Category dot */}
        <div
          className={cn(
            'w-3 h-3 rounded-full flex-shrink-0',
            categoryStyle.dot,
            'group-hover:scale-110 transition-transform duration-200',
          )}
        />

        {/* Event content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {event.title}
            </span>
            {priorityIcon && (
              <span className="text-amber-500 flex-shrink-0">
                {priorityIcon}
              </span>
            )}
          </div>

          {/* Secondary info */}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {timeText && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {timeText}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1 truncate">
                <MapPinIcon className="w-3 h-3" />
                {location}
              </span>
            )}
            {attendees?.length > 0 && (
              <span className="flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {attendees.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Day grid rendering (month view)
  if (isDayGrid) {
    return (
      <div
        className={cn(
          'relative px-2 py-1 rounded-md text-xs font-medium overflow-hidden',
          'border-l-2 cursor-pointer group',
          categoryStyle.bg,
          categoryStyle.text,
          categoryStyle.border,
          'hover:shadow-md hover:scale-[1.02] transition-all duration-200',
        )}
      >
        {/* Background overlay for hover effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="relative flex items-center gap-1">
          {priorityIcon && (
            <span className="flex-shrink-0 opacity-80">{priorityIcon}</span>
          )}
          <span className="truncate flex-1">
            {timeText && <span className="font-semibold mr-1">{timeText}</span>}
            {event.title}
          </span>
          {attendees?.length > 0 && (
            <UsersIcon className="w-3 h-3 ml-auto opacity-70 flex-shrink-0" />
          )}
        </div>
      </div>
    );
  }

  // Time grid rendering (week/day view)
  if (isTimeGrid) {
    return (
      <div
        className={cn(
          'h-full w-full p-1 rounded-sm overflow-hidden relative',
          'cursor-pointer group',
          categoryStyle.bg,
          categoryStyle.text,
          'hover:shadow-lg transition-all duration-200',
        )}
      >
        {/* Priority indicator */}
        {priorityIcon && (
          <div className="absolute top-1 right-1 opacity-80">
            {priorityIcon}
          </div>
        )}

        {/* Event content */}
        <div className="flex flex-col h-full">
          <div className="font-medium text-xs truncate pr-4">{event.title}</div>

          {/* Additional info for larger events */}
          <div className="flex-1 mt-1 text-xs opacity-90">
            {location && (
              <div className="flex items-center gap-1 truncate">
                <MapPinIcon className="w-2.5 h-2.5" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {attendees?.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <UsersIcon className="w-2.5 h-2.5" />
                <span>{attendees.length} attendees</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    );
  }

  // Fallback rendering
  return (
    <div className="px-1 text-xs">
      <span className="font-medium">{timeText}</span>
      <span className="ml-1">{event.title}</span>
    </div>
  );
};
