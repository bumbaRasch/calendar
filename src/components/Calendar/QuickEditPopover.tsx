import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { CalendarEvent, EventFormData } from '../../types/event';
import { CATEGORY_CONFIG } from '../../types/event';

interface QuickEditPopoverProps {
  event: CalendarEvent;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSave: (eventData: Partial<EventFormData>) => void;
  onDelete: () => void;
  onOpenFullEdit: () => void;
}

export const QuickEditPopover: React.FC<QuickEditPopoverProps> = ({
  event,
  isVisible,
  position,
  onClose,
  onSave,
  onDelete,
  onOpenFullEdit,
}) => {
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: event.title,
    location: event.location || '',
    description: event.description || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({
      title: event.title,
      location: event.location || '',
      description: event.description || '',
    });
    setIsEditing(false);
    setHasChanges(false);
  }, [event]);

  const categoryConfig = CATEGORY_CONFIG[event.category];
  const startTime = new Date(event.start);
  const endTime = event.end ? new Date(event.end) : null;

  // Check if there are any changes
  useEffect(() => {
    const changed =
      formData.title !== event.title ||
      formData.location !== (event.location || '') ||
      formData.description !== (event.description || '');
    setHasChanges(changed);
  }, [formData, event]);

  const handleSave = () => {
    if (hasChanges) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: event.title,
      location: event.location || '',
      description: event.description || '',
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const formatDateTime = (date: Date) => {
    if (event.allDay) {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }

    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = () => {
    if (event.allDay) {
      return 'All day';
    }

    if (!endTime) {
      return formatDateTime(startTime);
    }

    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
    }
    return `${minutes}m`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close popover"
      />

      {/* Popover */}
      <div
        className="fixed z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
        style={{
          left: Math.min(position.x, window.innerWidth - 320),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryConfig.color }}
            />
            <Badge
              variant="secondary"
              style={{
                backgroundColor: categoryConfig.backgroundColor,
                color: categoryConfig.textColor,
              }}
              className="text-xs"
            >
              {categoryConfig.label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <div>
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="font-medium"
                placeholder="Event title"
                maxLength={200}
              />
            ) : (
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {event.title}
              </h3>
            )}
          </div>

          {/* Date/Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(startTime)}</span>
            {!event.allDay && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{formatDuration()}</span>
              </>
            )}
          </div>

          {/* Location */}
          {(event.location || isEditing) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              {isEditing ? (
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Add location"
                  className="flex-1 text-sm"
                  maxLength={200}
                />
              ) : (
                <span className="text-sm text-gray-600">{event.location}</span>
              )}
            </div>
          )}

          {/* Description */}
          {(event.description || isEditing) && (
            <div className="space-y-1">
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Add description"
                  rows={2}
                  maxLength={500}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {event.description}
                </p>
              )}
            </div>
          )}

          {/* Attendees count */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{event.attendees.length} attendees</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-1"
              >
                <Save className="h-3 w-3" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                Quick Edit
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenFullEdit}>
                Full Edit
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </div>
    </>
  );
};
