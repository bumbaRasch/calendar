import type { EventInput } from '@fullcalendar/core';
import type { EventRecurrence } from './recurrence';

/**
 * Event Categories with associated styling
 */
export enum EventCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  MEETING = 'meeting',
  HEALTH = 'health',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  SOCIAL = 'social',
  OTHER = 'other',
}

/**
 * Event Priority Levels
 */
export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Event Status
 */
export enum EventStatus {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

/**
 * Category configuration with colors and icons
 */
export interface CategoryConfig {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

/**
 * Enhanced event interface extending FullCalendar's EventInput
 */
export interface CalendarEvent extends Omit<EventInput, 'id'> {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;

  // Enhanced properties
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  description?: string;
  location?: string;
  attendees?: string[];
  url?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // Recurrence
  recurrence?: EventRecurrence;

  // Notifications (for future implementation)
  reminders?: {
    type: 'email' | 'popup' | 'push';
    minutesBefore: number;
  }[];
}

/**
 * Event form data interface
 */
export interface EventFormData {
  id?: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  category: EventCategory;
  priority: EventPriority;
  status: EventStatus;
  description?: string;
  location?: string;
  attendees?: string[];
  url?: string;
  recurrence?: EventRecurrence;
}

/**
 * Event filter options
 */
export interface EventFilters {
  categories?: EventCategory[];
  priorities?: EventPriority[];
  statuses?: EventStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

/**
 * Event statistics
 */
export interface EventStats {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsByPriority: Record<EventPriority, number>;
  eventsByStatus: Record<EventStatus, number>;
  upcomingEvents: number;
  overdueEvents: number;
}

/**
 * Category configuration mapping
 */
export const CATEGORY_CONFIG: Record<EventCategory, CategoryConfig> = {
  [EventCategory.WORK]: {
    label: 'Work',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    icon: '💼',
  },
  [EventCategory.PERSONAL]: {
    label: 'Personal',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
    textColor: '#047857',
    icon: '🏠',
  },
  [EventCategory.MEETING]: {
    label: 'Meeting',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#d97706',
    icon: '🤝',
  },
  [EventCategory.HEALTH]: {
    label: 'Health',
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    textColor: '#dc2626',
    icon: '🏥',
  },
  [EventCategory.EDUCATION]: {
    label: 'Education',
    color: '#8b5cf6',
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
    textColor: '#7c3aed',
    icon: '📚',
  },
  [EventCategory.TRAVEL]: {
    label: 'Travel',
    color: '#06b6d4',
    backgroundColor: '#cffafe',
    borderColor: '#06b6d4',
    textColor: '#0891b2',
    icon: '✈️',
  },
  [EventCategory.SOCIAL]: {
    label: 'Social',
    color: '#ec4899',
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    textColor: '#db2777',
    icon: '🎉',
  },
  [EventCategory.OTHER]: {
    label: 'Other',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderColor: '#6b7280',
    textColor: '#4b5563',
    icon: '📌',
  },
};

/**
 * Priority configuration mapping
 */
export const PRIORITY_CONFIG = {
  [EventPriority.LOW]: {
    label: 'Low',
    color: '#6b7280',
    icon: '🔵',
  },
  [EventPriority.MEDIUM]: {
    label: 'Medium',
    color: '#f59e0b',
    icon: '🟡',
  },
  [EventPriority.HIGH]: {
    label: 'High',
    color: '#ef4444',
    icon: '🟠',
  },
  [EventPriority.URGENT]: {
    label: 'Urgent',
    color: '#dc2626',
    icon: '🔴',
  },
};

/**
 * Status configuration mapping
 */
export const STATUS_CONFIG = {
  [EventStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: '#10b981',
    icon: '✅',
  },
  [EventStatus.TENTATIVE]: {
    label: 'Tentative',
    color: '#f59e0b',
    icon: '❓',
  },
  [EventStatus.CANCELLED]: {
    label: 'Cancelled',
    color: '#ef4444',
    icon: '❌',
  },
  [EventStatus.COMPLETED]: {
    label: 'Completed',
    color: '#6b7280',
    icon: '☑️',
  },
};

/**
 * Utility functions
 */
export const eventUtils = {
  /**
   * Convert CalendarEvent to FullCalendar EventInput
   */
  toFullCalendarEvent: (event: CalendarEvent): EventInput => {
    const categoryConfig = CATEGORY_CONFIG[event.category];

    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      backgroundColor: categoryConfig.backgroundColor,
      borderColor: categoryConfig.borderColor,
      textColor: categoryConfig.textColor,
      extendedProps: {
        category: event.category,
        priority: event.priority,
        status: event.status,
        description: event.description,
        location: event.location,
        attendees: event.attendees,
        url: event.url,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        createdBy: event.createdBy,
        recurrence: event.recurrence,
        reminders: event.reminders,
      },
    };
  },

  /**
   * Convert FullCalendar EventInput to CalendarEvent
   */
  fromFullCalendarEvent: (event: EventInput): CalendarEvent => {
    const extendedProps = event.extendedProps || {};

    return {
      id: event.id as string,
      title: event.title as string,
      start: event.start as string | Date,
      end: event.end as string | Date,
      allDay: event.allDay,
      category: extendedProps.category || EventCategory.OTHER,
      priority: extendedProps.priority || EventPriority.MEDIUM,
      status: extendedProps.status || EventStatus.CONFIRMED,
      description: extendedProps.description,
      location: extendedProps.location,
      attendees: extendedProps.attendees,
      url: extendedProps.url,
      createdAt: extendedProps.createdAt || new Date().toISOString(),
      updatedAt: extendedProps.updatedAt || new Date().toISOString(),
      createdBy: extendedProps.createdBy,
      recurrence: extendedProps.recurrence,
      reminders: extendedProps.reminders,
    };
  },

  /**
   * Generate event ID
   */
  generateId: (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format event time for display
   */
  formatEventTime: (
    start: string | Date,
    end?: string | Date,
    allDay?: boolean,
  ): string => {
    if (allDay) return 'All day';

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTime = endDate
      ? endDate.toLocaleTimeString('en-US', timeOptions)
      : null;

    return endTime ? `${startTime} - ${endTime}` : startTime;
  },

  /**
   * Format event date for display
   */
  formatEventDate: (start: string | Date): string => {
    const date = new Date(start);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Check if event is today
   */
  isToday: (start: string | Date): boolean => {
    const eventDate = new Date(start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  },

  /**
   * Check if event is upcoming (within next 7 days)
   */
  isUpcoming: (start: string | Date): boolean => {
    const eventDate = new Date(start);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate > today && eventDate <= weekFromNow;
  },

  /**
   * Check if event is overdue
   */
  isOverdue: (start: string | Date, status: EventStatus): boolean => {
    if (status === EventStatus.COMPLETED || status === EventStatus.CANCELLED) {
      return false;
    }
    const eventDate = new Date(start);
    const now = new Date();
    return eventDate < now;
  },
};
