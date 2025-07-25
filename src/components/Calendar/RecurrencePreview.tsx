import React from 'react';
import { Calendar, Clock, Repeat, CalendarDays } from 'lucide-react';
import type { RecurrencePattern } from '../../types/recurrence';
import {
  RecurrenceFrequency,
  RecurrenceEndType,
  WeekDay,
} from '../../types/recurrence';
import { Badge } from '../ui/badge';

interface RecurrencePreviewProps {
  pattern: RecurrencePattern;
  eventStart: Date;
  eventTitle?: string;
  className?: string;
}

export const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({
  pattern,
  eventStart,
  eventTitle: _eventTitle,
  className,
}) => {
  const generateNextOccurrences = (count: number = 5): Date[] => {
    const occurrences: Date[] = [];
    let current = new Date(eventStart);

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        occurrences.push(new Date(current));
      } else {
        switch (pattern.frequency) {
          case RecurrenceFrequency.DAILY: {
            current = new Date(
              current.getTime() + pattern.interval * 24 * 60 * 60 * 1000,
            );
            break;
          }
          case RecurrenceFrequency.WEEKLY: {
            current = new Date(
              current.getTime() + pattern.interval * 7 * 24 * 60 * 60 * 1000,
            );
            break;
          }
          case RecurrenceFrequency.MONTHLY: {
            current = new Date(current);
            current.setMonth(current.getMonth() + pattern.interval);
            break;
          }
          case RecurrenceFrequency.YEARLY: {
            current = new Date(current);
            current.setFullYear(current.getFullYear() + pattern.interval);
            break;
          }
        }

        // Check if we've reached the end condition
        if (pattern.endType === RecurrenceEndType.ON_DATE && pattern.endDate) {
          if (current > new Date(pattern.endDate)) break;
        }
        if (
          pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES &&
          pattern.occurrences
        ) {
          if (occurrences.length >= pattern.occurrences) break;
        }

        occurrences.push(new Date(current));
      }
    }

    return occurrences;
  };

  const getFrequencyDescription = (): string => {
    const { frequency, interval } = pattern;

    switch (frequency) {
      case RecurrenceFrequency.DAILY:
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case RecurrenceFrequency.WEEKLY: {
        const weekDaysText = pattern.weekDays?.length
          ? ` on ${pattern.weekDays.map((day) => getWeekDayName(day)).join(', ')}`
          : '';
        return interval === 1
          ? `Weekly${weekDaysText}`
          : `Every ${interval} weeks${weekDaysText}`;
      }
      case RecurrenceFrequency.MONTHLY:
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      case RecurrenceFrequency.YEARLY:
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;
      default:
        return 'Custom';
    }
  };

  const getWeekDayName = (weekDay: WeekDay): string => {
    const days = {
      [WeekDay.SUNDAY]: 'Sun',
      [WeekDay.MONDAY]: 'Mon',
      [WeekDay.TUESDAY]: 'Tue',
      [WeekDay.WEDNESDAY]: 'Wed',
      [WeekDay.THURSDAY]: 'Thu',
      [WeekDay.FRIDAY]: 'Fri',
      [WeekDay.SATURDAY]: 'Sat',
    };
    return days[weekDay] || '';
  };

  const getEndDescription = (): string => {
    switch (pattern.endType) {
      case RecurrenceEndType.NEVER:
        return 'Never ends';
      case RecurrenceEndType.ON_DATE:
        return pattern.endDate
          ? `Ends on ${new Date(pattern.endDate).toLocaleDateString()}`
          : 'Ends on specific date';
      case RecurrenceEndType.AFTER_OCCURRENCES:
        return pattern.occurrences
          ? `Ends after ${pattern.occurrences} occurrences`
          : 'Ends after specific number';
      default:
        return '';
    }
  };

  const nextOccurrences = generateNextOccurrences();

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">
          Recurring Event Preview
        </span>
      </div>

      {/* Pattern Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{getFrequencyDescription()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Clock className="h-4 w-4" />
          <span>{getEndDescription()}</span>
        </div>
      </div>

      {/* Next Occurrences */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-blue-900">Next Occurrences:</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {nextOccurrences.map((occurrence, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs bg-white rounded px-2 py-1 border border-blue-100"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-blue-500" />
                <span className="font-medium">
                  {occurrence.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year:
                      occurrence.getFullYear() !== new Date().getFullYear()
                        ? 'numeric'
                        : undefined,
                  })}
                </span>
                <span className="text-blue-600">
                  {occurrence.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {index === 0 && (
                <Badge variant="secondary" className="text-xs">
                  First
                </Badge>
              )}
            </div>
          ))}

          {/* Show if there are more occurrences */}
          {(pattern.endType === RecurrenceEndType.NEVER ||
            (pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES &&
              pattern.occurrences &&
              pattern.occurrences > nextOccurrences.length)) && (
            <div className="text-xs text-blue-600 italic px-2">
              ... and more
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex gap-4 text-xs text-blue-700 border-t border-blue-200 pt-2">
        <div>
          <span className="font-medium">Frequency:</span> {pattern.frequency}
        </div>
        <div>
          <span className="font-medium">Interval:</span> {pattern.interval}
        </div>
        {pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES &&
          pattern.occurrences && (
            <div>
              <span className="font-medium">Total:</span> {pattern.occurrences}
            </div>
          )}
      </div>
    </div>
  );
};
