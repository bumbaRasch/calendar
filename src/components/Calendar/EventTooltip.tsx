import React from 'react';
import { createPortal } from 'react-dom';
import {
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  LinkIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import type { CalendarEvent } from '../../types/event';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { cn } from '../../lib/utils';
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  eventUtils,
} from '../../types/event';

interface EventTooltipProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  isVisible: boolean;
  onClose: () => void;
}

interface TooltipPortalProps {
  children: React.ReactNode;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children }) => {
  const portalRoot = document.getElementById('tooltip-root') || document.body;
  return createPortal(children, portalRoot);
};

export const EventTooltip: React.FC<EventTooltipProps> = ({
  event,
  position,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const categoryConfig = CATEGORY_CONFIG[event.category];
  const priorityConfig = PRIORITY_CONFIG[event.priority];
  const statusConfig = STATUS_CONFIG[event.status];

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.max(position.y - 10, 10),
  };

  const timeDisplay = eventUtils.formatEventTime(
    event.start,
    event.end,
    event.allDay,
  );
  const dateDisplay = eventUtils.formatEventDate(event.start);

  return (
    <TooltipPortal>
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        <Card
          className={cn(
            'w-80 max-w-sm shadow-xl border-0 pointer-events-auto',
            'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'ring-1 ring-gray-200 dark:ring-gray-700',
          )}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">
                    {categoryConfig.icon}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-medium border',
                      `border-[${categoryConfig.borderColor}]`,
                      `text-[${categoryConfig.textColor}]`,
                      `bg-[${categoryConfig.backgroundColor}]`,
                    )}
                  >
                    {categoryConfig.label}
                  </Badge>
                  {event.priority !== 'low' && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        event.priority === 'urgent' &&
                          'border-red-500 text-red-700 bg-red-50',
                        event.priority === 'high' &&
                          'border-orange-500 text-orange-700 bg-orange-50',
                        event.priority === 'medium' &&
                          'border-yellow-500 text-yellow-700 bg-yellow-50',
                      )}
                    >
                      {priorityConfig.icon} {priorityConfig.label}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                  {event.title}
                </h3>
              </div>

              <button
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full',
                  'flex items-center justify-center',
                  'text-gray-400 hover:text-gray-600',
                  'dark:text-gray-500 dark:hover:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-colors duration-150',
                )}
                aria-label="Close tooltip"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Date and Time */}
            <div className="flex items-start gap-3 text-sm">
              <CalendarIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {dateDisplay}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {timeDisplay}
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description}
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {event.location}
                </span>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <UsersIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {event.attendees.length} attendee
                    {event.attendees.length !== 1 ? 's' : ''}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {event.attendees.slice(0, 3).join(', ')}
                    {event.attendees.length > 3 &&
                      ` +${event.attendees.length - 3} more`}
                  </div>
                </div>
              </div>
            )}

            {/* URL */}
            {event.url && (
              <div className="flex items-center gap-3 text-sm">
                <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'text-primary-600 dark:text-primary-400',
                    'hover:text-primary-700 dark:hover:text-primary-300',
                    'underline underline-offset-2 truncate flex-1',
                    'transition-colors duration-150',
                  )}
                >
                  Join meeting
                </a>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    event.status === 'confirmed' &&
                      'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20',
                    event.status === 'tentative' &&
                      'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
                    event.status === 'cancelled' &&
                      'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/20',
                    event.status === 'completed' &&
                      'border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-900/20',
                  )}
                >
                  {statusConfig.icon} {statusConfig.label}
                </Badge>
              </div>

              {/* Time indicators */}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {eventUtils.isToday(event.start) && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    Today
                  </Badge>
                )}
                {eventUtils.isUpcoming(event.start) &&
                  !eventUtils.isToday(event.start) && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    >
                      Upcoming
                    </Badge>
                  )}
                {eventUtils.isOverdue(event.start, event.status) && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangleIcon className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>

            {/* Created info */}
            {event.createdBy && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Created by {event.createdBy}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipPortal>
  );
};
