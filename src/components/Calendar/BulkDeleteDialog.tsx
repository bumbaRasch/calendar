import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  CalendarX,
} from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import type { CalendarEvent } from '../../types/event';
import { CATEGORY_CONFIG } from '../../types/event';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (eventIds: string[]) => void;
  events: CalendarEvent[];
  isLoading?: boolean;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  events,
  isLoading = false,
}) => {
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set(events.map((event) => event.id)),
  );

  const handleEventToggle = (eventId: string) => {
    const newSelected = new Set(selectedEventIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEventIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEventIds.size === events.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(events.map((event) => event.id)));
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedEventIds));
  };

  const formatEventDate = (event: CalendarEvent) => {
    const date = new Date(event.start);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: event.allDay ? undefined : 'numeric',
      minute: event.allDay ? undefined : '2-digit',
    });
  };

  const selectedCount = selectedEventIds.size;
  const recurringCount = events.filter(
    (event) =>
      selectedEventIds.has(event.id) &&
      !!event.recurrence &&
      !event.recurrence.parentEventId,
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Multiple Events
            {selectedCount > 0 && (
              <Badge variant="destructive">{selectedCount} selected</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-left">
            Select the events you want to delete. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Select All Toggle */}
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2 h-auto p-2"
          >
            {selectedEventIds.size === events.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedEventIds.size === events.length
              ? 'Deselect All'
              : 'Select All'}
          </Button>
          <span className="text-sm text-gray-600">
            {events.length} events total
          </span>
        </div>

        {/* Event List */}
        <ScrollArea className="max-h-80 w-full border rounded-lg">
          <div className="p-2 space-y-2">
            {events.map((event) => {
              const categoryConfig = CATEGORY_CONFIG[event.category];
              const isSelected = selectedEventIds.has(event.id);
              const isRecurring =
                !!event.recurrence && !event.recurrence.parentEventId;
              const isRecurringInstance = !!event.recurrence?.parentEventId;

              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleEventToggle(event.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEventToggle(event.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleEventToggle(event.id)}
                    className="mt-1"
                  />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: categoryConfig.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      {isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          <CalendarX className="h-3 w-3 mr-1" />
                          Series
                        </Badge>
                      )}
                      {isRecurringInstance && (
                        <Badge variant="secondary" className="text-xs">
                          Instance
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatEventDate(event)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Warning Section */}
        {selectedCount > 0 && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <strong>Warning:</strong> You are about to delete {selectedCount}{' '}
              event{selectedCount !== 1 ? 's' : ''}.
              {recurringCount > 0 && (
                <span className="block mt-1">
                  {recurringCount} recurring series will be completely deleted,
                  including all future occurrences.
                </span>
              )}
              <span className="block mt-1">This action cannot be undone.</span>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || selectedCount === 0}
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
                Delete {selectedCount} Event{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
