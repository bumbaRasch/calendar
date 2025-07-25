import React from 'react';
import { Trash2, AlertTriangle, CalendarX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { CalendarEvent } from '../../types/event';
import { CATEGORY_CONFIG } from '../../types/event';

interface DeleteEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: CalendarEvent | null;
  isLoading?: boolean;
}

export const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
  isLoading = false,
}) => {
  if (!event) return null;

  const categoryConfig = CATEGORY_CONFIG[event.category];
  const eventDate = new Date(event.start);
  const isRecurring = !!event.recurrence && !event.recurrence.parentEventId;
  const isRecurringInstance = !!event.recurrence?.parentEventId;

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: event.allDay ? undefined : 'numeric',
      minute: event.allDay ? undefined : '2-digit',
    });
  };

  const getDeleteWarningText = () => {
    if (isRecurring) {
      return 'This will delete the entire recurring series and all future occurrences.';
    }
    if (isRecurringInstance) {
      return 'This will delete only this occurrence. Other events in the series will remain.';
    }
    return 'This action cannot be undone.';
  };

  const getDeleteDescription = () => {
    if (isRecurring) {
      return "You're about to delete a recurring event series";
    }
    if (isRecurringInstance) {
      return "You're about to delete a recurring event instance";
    }
    return "You're about to delete this event";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Event
            {isRecurring && <Badge variant="secondary">Series</Badge>}
            {isRecurringInstance && <Badge variant="outline">Instance</Badge>}
          </DialogTitle>
          <DialogDescription className="text-left">
            {getDeleteDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Event Details Card */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
              style={{ backgroundColor: categoryConfig.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatEventDate(eventDate)}
              </p>
              {event.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: categoryConfig.backgroundColor,
                    color: categoryConfig.textColor,
                  }}
                >
                  {categoryConfig.label}
                </Badge>
                {isRecurring && (
                  <Badge variant="outline" className="text-xs">
                    <CalendarX className="h-3 w-3 mr-1" />
                    Recurring Series
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <strong>Warning:</strong> {getDeleteWarningText()}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
