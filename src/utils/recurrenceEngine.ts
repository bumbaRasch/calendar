/**
 * Recurrence rule engine for generating recurring event instances
 */

import type { CalendarEvent } from '../types/event';
import {
  RecurrenceFrequency,
  RecurrenceEndType,
  MonthlyRecurrenceType,
  type RecurrencePattern,
  type RecurringEventInstance,
  type RecurrenceValidation,
} from '../types/recurrence';

export class RecurrenceEngine {
  /**
   * Generate recurring event instances based on a recurrence pattern
   */
  static generateInstances(
    baseEvent: CalendarEvent,
    pattern: RecurrencePattern,
    startRange: Date,
    endRange: Date,
  ): RecurringEventInstance[] {
    const instances: RecurringEventInstance[] = [];

    if (!this.validatePattern(pattern).isValid) {
      return instances;
    }

    const eventStart = new Date(baseEvent.start);
    const eventEnd = baseEvent.end ? new Date(baseEvent.end) : null;
    const duration = eventEnd ? eventEnd.getTime() - eventStart.getTime() : 0;

    let currentDate = new Date(eventStart);
    let occurrenceCount = 0;

    // Calculate end boundary
    const endBoundary = this.calculateEndBoundary(pattern, endRange);

    while (currentDate <= endBoundary && currentDate <= endRange) {
      // Check if we've reached the occurrence limit
      if (
        pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES &&
        occurrenceCount >= (pattern.occurrences || 0)
      ) {
        break;
      }

      // Check if current date is within range and not an exception
      if (
        currentDate >= startRange &&
        !this.isException(currentDate, pattern.exceptions)
      ) {
        // Check if this date matches the pattern
        if (this.matchesPattern(currentDate, eventStart, pattern)) {
          instances.push({
            date: new Date(currentDate),
            endDate:
              duration > 0
                ? new Date(currentDate.getTime() + duration)
                : undefined,
            isException: false,
            isModified: false,
          });
          occurrenceCount++;
        }
      }

      // Move to next potential date
      currentDate = this.getNextDate(currentDate, pattern);
    }

    return instances;
  }

  /**
   * Validate a recurrence pattern
   */
  static validatePattern(pattern: RecurrencePattern): RecurrenceValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate interval
    if (pattern.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    // Validate end conditions
    if (pattern.endType === RecurrenceEndType.ON_DATE && !pattern.endDate) {
      errors.push('End date is required when end type is "On specific date"');
    }

    if (
      pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES &&
      (!pattern.occurrences || pattern.occurrences < 1)
    ) {
      errors.push('Number of occurrences must be at least 1');
    }

    // Validate weekly pattern
    if (
      pattern.frequency === RecurrenceFrequency.WEEKLY &&
      (!pattern.weekDays || pattern.weekDays.length === 0)
    ) {
      warnings.push('No weekdays selected for weekly recurrence');
    }

    // Validate monthly pattern
    if (pattern.frequency === RecurrenceFrequency.MONTHLY) {
      if (pattern.monthlyType === MonthlyRecurrenceType.DAY_OF_MONTH) {
        if (
          !pattern.dayOfMonth ||
          pattern.dayOfMonth < 1 ||
          pattern.dayOfMonth > 31
        ) {
          errors.push('Day of month must be between 1 and 31');
        }
      } else if (pattern.monthlyType === MonthlyRecurrenceType.DAY_OF_WEEK) {
        if (
          pattern.weekOfMonth === undefined ||
          pattern.dayOfWeek === undefined
        ) {
          errors.push(
            'Week of month and day of week are required for this monthly pattern',
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Calculate the end boundary for recurrence generation
   */
  private static calculateEndBoundary(
    pattern: RecurrencePattern,
    defaultEnd: Date,
  ): Date {
    if (pattern.endType === RecurrenceEndType.ON_DATE && pattern.endDate) {
      return new Date(pattern.endDate);
    }

    // For never-ending or occurrence-based patterns, use a reasonable limit
    const maxDate = new Date(defaultEnd);
    maxDate.setFullYear(maxDate.getFullYear() + 2); // Limit to 2 years
    return maxDate;
  }

  /**
   * Check if a date is in the exceptions list
   */
  private static isException(date: Date, exceptions?: string[]): boolean {
    if (!exceptions || exceptions.length === 0) return false;

    const dateString = date.toISOString().split('T')[0];
    return exceptions.some((exception) => {
      const exceptionDate = new Date(exception).toISOString().split('T')[0];
      return dateString === exceptionDate;
    });
  }

  /**
   * Check if a date matches the recurrence pattern
   */
  private static matchesPattern(
    date: Date,
    originalDate: Date,
    pattern: RecurrencePattern,
  ): boolean {
    switch (pattern.frequency) {
      case RecurrenceFrequency.DAILY:
        return true; // All days match for daily recurrence

      case RecurrenceFrequency.WEEKLY:
        if (!pattern.weekDays || pattern.weekDays.length === 0) {
          // If no specific days selected, use the original event's day
          return date.getDay() === originalDate.getDay();
        }
        return pattern.weekDays.includes(date.getDay());

      case RecurrenceFrequency.MONTHLY:
        if (pattern.monthlyType === MonthlyRecurrenceType.DAY_OF_MONTH) {
          return (
            date.getDate() === (pattern.dayOfMonth || originalDate.getDate())
          );
        } else if (pattern.monthlyType === MonthlyRecurrenceType.DAY_OF_WEEK) {
          return (
            date.getDay() === (pattern.dayOfWeek || originalDate.getDay()) &&
            this.getWeekOfMonth(date) ===
              (pattern.weekOfMonth || this.getWeekOfMonth(originalDate))
          );
        }
        return date.getDate() === originalDate.getDate();

      case RecurrenceFrequency.YEARLY:
        return (
          date.getMonth() === originalDate.getMonth() &&
          date.getDate() === originalDate.getDate()
        );

      default:
        return false;
    }
  }

  /**
   * Get the next potential date based on frequency
   */
  private static getNextDate(
    currentDate: Date,
    pattern: RecurrencePattern,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (pattern.frequency) {
      case RecurrenceFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + pattern.interval);
        break;

      case RecurrenceFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 1); // Move day by day for weekly
        break;

      case RecurrenceFrequency.MONTHLY:
        if (pattern.monthlyType === MonthlyRecurrenceType.DAY_OF_WEEK) {
          nextDate.setDate(nextDate.getDate() + 1); // Check each day
        } else {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        }
        break;

      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        break;
    }

    return nextDate;
  }

  /**
   * Get the week of the month for a date (1-5)
   */
  private static getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const firstDayOfWeek = firstDay.getDay();

    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  }

  /**
   * Create event instances from a recurring event
   */
  static createEventInstances(
    baseEvent: CalendarEvent,
    instances: RecurringEventInstance[],
  ): CalendarEvent[] {
    return instances
      .map((instance) => {
        const instanceEvent: CalendarEvent = {
          ...baseEvent,
          id: `${baseEvent.id}_${instance.date.toISOString()}`,
          start: instance.date.toISOString(),
          end: instance.endDate?.toISOString(),
          recurrence: {
            ...baseEvent.recurrence!,
            parentEventId: baseEvent.id,
            instanceDate: instance.date.toISOString(),
          },
        };

        // Apply any modifications for this instance
        if (baseEvent.recurrence?.modifications) {
          const modification = baseEvent.recurrence.modifications.find(
            (mod) =>
              new Date(mod.originalDate).toISOString() ===
              instance.date.toISOString(),
          );

          if (modification) {
            if (modification.isDeleted) {
              return null; // This instance is deleted
            }
            if (modification.modifiedEvent) {
              Object.assign(instanceEvent, modification.modifiedEvent);
            }
          }
        }

        return instanceEvent;
      })
      .filter((event): event is CalendarEvent => event !== null);
  }

  /**
   * Format recurrence description for display
   */
  static getRecurrenceDescription(pattern: RecurrencePattern): string {
    let description = `Repeats ${pattern.frequency}`;

    if (pattern.interval > 1) {
      description += ` every ${pattern.interval} ${pattern.frequency}s`;
    }

    if (
      pattern.frequency === RecurrenceFrequency.WEEKLY &&
      pattern.weekDays?.length
    ) {
      const days = pattern.weekDays
        .map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day])
        .join(', ');
      description += ` on ${days}`;
    }

    if (pattern.endType === RecurrenceEndType.ON_DATE && pattern.endDate) {
      description += ` until ${new Date(pattern.endDate).toLocaleDateString()}`;
    } else if (pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES) {
      description += ` for ${pattern.occurrences} occurrences`;
    }

    return description;
  }
}
