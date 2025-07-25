import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  LinkIcon,
  AlertCircleIcon,
  Trash2,
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
import { DialogErrorBoundary } from '../ErrorBoundaries';
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
import { RecurrenceConfig } from './RecurrenceConfig';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
  onDelete?: () => void;
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
  onDelete,
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

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Event title must be less than 200 characters';
    }

    // Date validation
    if (!formData.start) {
      newErrors.start = 'Start date is required';
    }

    if (formData.end && formData.start) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);

      if (endDate <= startDate) {
        newErrors.end = 'End date must be after start date';
      }

      // Check for reasonable duration (max 30 days for single event)
      const diffDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) {
        newErrors.end = 'Event duration cannot exceed 30 days';
      }
    }

    // URL validation
    if (formData.url && formData.url.trim()) {
      if (!isValidUrl(formData.url.trim())) {
        newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Location validation
    if (formData.location && formData.location.length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }

    // Attendees validation
    if (formData.attendees && formData.attendees.length > 50) {
      newErrors.attendees = 'Maximum 50 attendees allowed';
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddAttendee = () => {
    const trimmedInput = attendeeInput.trim();

    if (!trimmedInput) return;

    // Check if already exists
    if (formData.attendees?.includes(trimmedInput)) {
      return;
    }

    // Validate email format
    if (!validateEmail(trimmedInput)) {
      setErrors((prev) => ({
        ...prev,
        attendees: 'Please enter a valid email address',
      }));
      return;
    }

    // Clear attendees error if it was set
    if (errors.attendees) {
      setErrors((prev) => ({ ...prev, attendees: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      attendees: [...(prev.attendees || []), trimmedInput],
    }));
    setAttendeeInput('');
  };

  const handleRemoveAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees?.filter((a) => a !== attendee) || [],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Real-time validation for specific fields
  const validateField = (field: keyof EventFormData, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Event title is required';
        } else if (value.trim().length > 200) {
          newErrors.title = 'Event title must be less than 200 characters';
        } else {
          delete newErrors.title;
        }
        break;

      case 'url':
        if (value && value.trim() && !isValidUrl(value.trim())) {
          newErrors.url =
            'Please enter a valid URL (e.g., https://example.com)';
        } else {
          delete newErrors.url;
        }
        break;

      case 'description':
        if (value && value.length > 1000) {
          newErrors.description =
            'Description must be less than 1000 characters';
        } else {
          delete newErrors.description;
        }
        break;

      case 'location':
        if (value && value.length > 200) {
          newErrors.location = 'Location must be less than 200 characters';
        } else {
          delete newErrors.location;
        }
        break;

      case 'end':
        if (value && formData.start) {
          const startDate = new Date(formData.start);
          const endDate = new Date(value);

          if (endDate <= startDate) {
            newErrors.end = 'End date must be after start date';
          } else {
            const diffDays =
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 30) {
              newErrors.end = 'Event duration cannot exceed 30 days';
            } else {
              delete newErrors.end;
            }
          }
        } else {
          delete newErrors.end;
        }
        break;
    }

    setErrors(newErrors);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogErrorBoundary
        onClose={onClose}
        dialogTitle={
          initialData && 'id' in initialData && initialData.id
            ? 'Edit Event'
            : 'Create Event'
        }
      >
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
              <div className="flex justify-between items-center">
                <Label htmlFor="title" className="text-sm font-medium">
                  Event Title *
                </Label>
                <span
                  className={cn(
                    'text-xs',
                    formData.title.length > 180
                      ? 'text-red-500'
                      : 'text-gray-500',
                  )}
                >
                  {formData.title.length}/200
                </span>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, title: value }));
                  validateField('title', value);
                }}
                placeholder="Enter event title..."
                className={cn(errors.title && 'border-red-500')}
                maxLength={200}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, start: value }));
                    // Revalidate end date when start date changes
                    if (formData.end) {
                      validateField('end', formData.end);
                    }
                  }}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, end: value }));
                    validateField('end', value);
                  }}
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
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <span
                  className={cn(
                    'text-xs',
                    (formData.description?.length || 0) > 900
                      ? 'text-red-500'
                      : 'text-gray-500',
                  )}
                >
                  {formData.description?.length || 0}/1000
                </span>
              </div>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, description: value }));
                  validateField('description', value);
                }}
                placeholder="Add event description..."
                rows={3}
                maxLength={1000}
                className={cn(
                  'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none',
                  errors.description && 'border-red-500',
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircleIcon className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="location"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <MapPinIcon className="h-4 w-4" />
                  Location
                </Label>
                <span
                  className={cn(
                    'text-xs',
                    (formData.location?.length || 0) > 180
                      ? 'text-red-500'
                      : 'text-gray-500',
                  )}
                >
                  {formData.location?.length || 0}/200
                </span>
              </div>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, location: value }));
                  validateField('location', value);
                }}
                placeholder="Enter event location..."
                className={cn(errors.location && 'border-red-500')}
                maxLength={200}
              />
              {errors.location && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircleIcon className="h-4 w-4" />
                  {errors.location}
                </p>
              )}
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
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, url: value }));
                  validateField('url', value);
                }}
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
                  onKeyDown={(e) => handleKeyDown(e, handleAddAttendee)}
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

            {/* Recurrence Configuration */}
            <RecurrenceConfig
              value={formData.recurrence}
              onChange={(pattern) =>
                setFormData((prev) => ({ ...prev, recurrence: pattern }))
              }
              eventStart={new Date(formData.start)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {initialData && onDelete && (
                <Button
                  variant="destructive"
                  onClick={onDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <Button
              onClick={handleSave}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {initialData ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogErrorBoundary>
    </Dialog>
  );
};
