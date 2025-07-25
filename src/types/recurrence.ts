/**
 * Recurrence types and utilities for calendar events
 */

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum RecurrenceEndType {
  NEVER = 'never',
  ON_DATE = 'onDate',
  AFTER_OCCURRENCES = 'afterOccurrences',
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum MonthlyRecurrenceType {
  DAY_OF_MONTH = 'dayOfMonth',
  DAY_OF_WEEK = 'dayOfWeek',
}

/**
 * Recurrence pattern configuration
 */
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // Every N days/weeks/months/years

  // End conditions
  endType: RecurrenceEndType;
  endDate?: string; // ISO date string
  occurrences?: number; // Number of occurrences

  // Weekly options
  weekDays?: WeekDay[]; // For weekly frequency (e.g., every Mon, Wed, Fri)

  // Monthly options
  monthlyType?: MonthlyRecurrenceType;
  dayOfMonth?: number; // 1-31 for specific day
  weekOfMonth?: number; // 1-5 (5 = last) for nth weekday
  dayOfWeek?: WeekDay; // For nth weekday pattern

  // Exceptions
  exceptions?: string[]; // ISO date strings of exceptions

  // Metadata
  timezone?: string; // Timezone for recurring events
}

/**
 * Recurring event instance modification
 */
export interface RecurrenceModification {
  originalDate: string; // Original date of the instance
  modifiedEvent?: Record<string, unknown>; // Modified event data (using Record to avoid circular dependency)
  isDeleted?: boolean; // If this instance is deleted
}

/**
 * Extended recurrence interface for CalendarEvent
 */
export interface EventRecurrence extends RecurrencePattern {
  // Parent event ID for recurring instances
  parentEventId?: string;

  // Instance-specific data
  instanceDate?: string; // For recurring event instances

  // Modifications to specific instances
  modifications?: RecurrenceModification[];
}

/**
 * Recurrence validation result
 */
export interface RecurrenceValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Generated recurring event instance
 */
export interface RecurringEventInstance {
  date: Date;
  endDate?: Date;
  isException?: boolean;
  isModified?: boolean;
}

/**
 * Utility constants
 */
export const WEEKDAY_NAMES: Record<WeekDay, string> = {
  [WeekDay.SUNDAY]: 'Sunday',
  [WeekDay.MONDAY]: 'Monday',
  [WeekDay.TUESDAY]: 'Tuesday',
  [WeekDay.WEDNESDAY]: 'Wednesday',
  [WeekDay.THURSDAY]: 'Thursday',
  [WeekDay.FRIDAY]: 'Friday',
  [WeekDay.SATURDAY]: 'Saturday',
};

export const WEEKDAY_ABBREVIATIONS: Record<WeekDay, string> = {
  [WeekDay.SUNDAY]: 'Sun',
  [WeekDay.MONDAY]: 'Mon',
  [WeekDay.TUESDAY]: 'Tue',
  [WeekDay.WEDNESDAY]: 'Wed',
  [WeekDay.THURSDAY]: 'Thu',
  [WeekDay.FRIDAY]: 'Fri',
  [WeekDay.SATURDAY]: 'Sat',
};

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  [RecurrenceFrequency.DAILY]: 'Daily',
  [RecurrenceFrequency.WEEKLY]: 'Weekly',
  [RecurrenceFrequency.MONTHLY]: 'Monthly',
  [RecurrenceFrequency.YEARLY]: 'Yearly',
};

export const END_TYPE_LABELS: Record<RecurrenceEndType, string> = {
  [RecurrenceEndType.NEVER]: 'Never',
  [RecurrenceEndType.ON_DATE]: 'On specific date',
  [RecurrenceEndType.AFTER_OCCURRENCES]: 'After number of occurrences',
};

/**
 * Default recurrence pattern
 */
export const DEFAULT_RECURRENCE_PATTERN: RecurrencePattern = {
  frequency: RecurrenceFrequency.WEEKLY,
  interval: 1,
  endType: RecurrenceEndType.NEVER,
  weekDays: [],
  exceptions: [],
};
