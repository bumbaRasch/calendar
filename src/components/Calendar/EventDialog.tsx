import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  LinkIcon,
  AlertCircleIcon,
} from 'lucide-react';
import type { DateSelectArg } from '@fullcalendar/core';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import {
  EventCategory,
  EventPriority,
  EventStatus,
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  type EventFormData,
} from '../../types/event';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  selectedDateInfo?: DateSelectArg | null;
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

export const EventDialog: React.FC<EventDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedDateInfo,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    start: '',
    end: '',
    allDay: false,
    category: EventCategory.PERSONAL,
    priority: EventPriority.MEDIUM,
    status: EventStatus.CONFIRMED,
    description: '',
    location: '',
    attendees: [],
    url: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});
  const [attendeeInput, setAttendeeInput] = useState('');

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const defaultStart = selectedDateInfo?.start || now;
      const defaultEnd =
        selectedDateInfo?.end || new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

      setFormData({
        title: initialData?.title || '',
        start: formatDateForInput(defaultStart),
        end: formatDateForInput(defaultEnd),
        allDay: selectedDateInfo?.allDay || initialData?.allDay || false,
        category: initialData?.category || EventCategory.PERSONAL,
        priority: initialData?.priority || EventPriority.MEDIUM,
        status: initialData?.status || EventStatus.CONFIRMED,
        description: initialData?.description || '',
        location: initialData?.location || '',
        attendees: initialData?.attendees || [],
        url: initialData?.url || '',
      });
      setErrors({});
      setAttendeeInput('');
    }
  }, [isOpen, initialData, selectedDateInfo]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.start) {
      newErrors.start = 'Start date is required';
    }

    if (
      formData.end &&
      formData.start &&
      new Date(formData.end) <= new Date(formData.start)
    ) {
      newErrors.end = 'End date must be after start date';
    }

    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleAddAttendee = () => {
    if (
      attendeeInput.trim() &&
      !formData.attendees?.includes(attendeeInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeeInput.trim()],
      }));
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees?.filter((a) => a !== attendee) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'sm:max-w-[600px] max-h-[90vh] overflow-y-auto',
          'bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-gray-100',
          'shadow-2xl border border-gray-200 dark:border-gray-700',
          'backdrop-blur-none opacity-100',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {initialData ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription>
            {selectedDateInfo
              ? `Adding event for ${new Date(selectedDateInfo.start).toLocaleDateString()}`
              : 'Fill in the details for your event'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter event title..."
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircleIcon className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start" className="text-sm font-medium">
                Start Date & Time *
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.start}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start: e.target.value }))
                }
                className={cn(errors.start && 'border-red-500')}
              />
              {errors.start && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.start}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end" className="text-sm font-medium">
                End Date & Time
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.end}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end: e.target.value }))
                }
                className={cn(errors.end && 'border-red-500')}
              />
              {errors.end && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.end}
                </p>
              )}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="allDay"
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, allDay: e.target.checked }))
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <Label htmlFor="allDay" className="text-sm font-medium">
              All day event
            </Label>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Category</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      category: key as EventCategory,
                    }))
                  }
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border transition-all duration-200',
                    'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    formData.category === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                  )}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: key as EventPriority,
                    }))
                  }
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200',
                    'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    formData.priority === key
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                  )}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Add event description..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <MapPinIcon className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Enter event location..."
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label
              htmlFor="url"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <LinkIcon className="h-4 w-4" />
              Meeting URL
            </Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://..."
              className={cn(errors.url && 'border-red-500')}
            />
            {errors.url && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircleIcon className="h-3 w-3" />
                {errors.url}
              </p>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <UsersIcon className="h-4 w-4" />
              Attendees
            </Label>
            <div className="flex gap-2">
              <Input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                placeholder="Enter email or name..."
                onKeyPress={(e) => handleKeyPress(e, handleAddAttendee)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAttendee}
                disabled={!attendeeInput.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
            {formData.attendees && formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {attendee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee)}
                      className="ml-1 h-3 w-3 rounded-full bg-gray-500 text-white text-xs hover:bg-gray-600 focus:outline-none"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {initialData ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
