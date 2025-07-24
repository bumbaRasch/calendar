import React from 'react';
import type { CalendarEvent } from '../types/event';
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  eventUtils,
} from '../types/event';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'calendar' | 'list' | 'detail';
  onClick?: (event: CalendarEvent) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'calendar',
  onClick,
  onEdit,
  onDelete,
  className = '',
}) => {
  const categoryConfig = CATEGORY_CONFIG[event.category];
  const priorityConfig = PRIORITY_CONFIG[event.priority];
  const statusConfig = STATUS_CONFIG[event.status];

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(event);
  };

  // Calendar variant - minimal display for calendar cells
  if (variant === 'calendar') {
    return (
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className={`
          event-card-calendar relative group cursor-pointer rounded-sm px-1 py-0.5 text-xs
          transition-all duration-200 hover:shadow-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${className}
        `}
        style={{
          backgroundColor: categoryConfig.backgroundColor,
          borderLeft: `3px solid ${categoryConfig.borderColor}`,
          color: categoryConfig.textColor,
        }}
        title={`${event.title}${event.location ? ` @ ${event.location}` : ''}`}
        aria-label={`Event: ${event.title}${event.location ? ` at ${event.location}` : ''}`}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-75">{categoryConfig.icon}</span>
          <span className="truncate font-medium">{event.title}</span>
          {event.priority !== 'medium' && (
            <span className="text-xs opacity-75">{priorityConfig.icon}</span>
          )}
        </div>
      </div>
    );
  }

  // List variant - compact horizontal display
  if (variant === 'list') {
    return (
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className={`
          event-card-list group flex items-center gap-3 p-3 rounded-lg border
          cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
        style={{
          borderColor: categoryConfig.borderColor,
          backgroundColor: 'white',
        }}
        aria-label={`Event: ${event.title}${event.location ? ` at ${event.location}` : ''}`}
      >
        {/* Category indicator */}
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: categoryConfig.color }}
        >
          <span className="text-white">{categoryConfig.icon}</span>
        </div>

        {/* Event details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {event.title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {categoryConfig.label}
            </span>
            {event.priority !== 'medium' && (
              <span className="text-xs">{priorityConfig.icon}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              🕒{' '}
              {eventUtils.formatEventTime(event.start, event.end, event.allDay)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 truncate">
                📍 {event.location}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit event"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete event"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }

  // Detail variant - full detailed display
  return (
    <div
      className={`
        event-card-detail bg-white rounded-xl shadow-sm border border-gray-200 
        overflow-hidden transition-all duration-200 hover:shadow-md
        ${className}
      `}
    >
      {/* Header with category color */}
      <div
        className="p-4 border-b border-gray-100"
        style={{ backgroundColor: categoryConfig.backgroundColor }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: categoryConfig.color }}
            >
              <span className="text-white">{categoryConfig.icon}</span>
            </div>
            <div>
              <h2
                className="text-xl font-bold truncate"
                style={{ color: categoryConfig.textColor }}
              >
                {event.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: categoryConfig.color,
                    color: 'white',
                  }}
                >
                  {categoryConfig.label}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  {priorityConfig.icon} {priorityConfig.label}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  {statusConfig.icon} {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-all"
                title="Edit event"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white/50 rounded-lg transition-all"
                title="Delete event"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Date and time */}
        <div className="flex items-center gap-2 text-gray-700">
          <span className="text-blue-600">📅</span>
          <span className="font-medium">
            {eventUtils.formatEventDate(event.start)}
          </span>
          <span className="text-gray-500">•</span>
          <span>
            {eventUtils.formatEventTime(event.start, event.end, event.allDay)}
          </span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">📍</span>
            <span>{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="text-gray-700">
            <p className="text-sm leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Attendees */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-start gap-2 text-gray-700">
            <span className="text-purple-600 mt-0.5">👥</span>
            <div>
              <div className="text-sm font-medium mb-1">Attendees</div>
              <div className="flex flex-wrap gap-1">
                {event.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* URL */}
        {event.url && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-blue-600">🔗</span>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
            >
              {event.url}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>
            Created {new Date(event.createdAt).toLocaleDateString()}
            {event.createdBy && ` by ${event.createdBy}`}
          </span>
          {event.updatedAt !== event.createdAt && (
            <span>
              Updated {new Date(event.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
