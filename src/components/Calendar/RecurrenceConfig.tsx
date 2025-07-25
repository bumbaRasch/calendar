import React, { useState, useEffect } from 'react';
import { Calendar, Repeat } from 'lucide-react';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import {
  RecurrenceFrequency,
  RecurrenceEndType,
  WeekDay,
  MonthlyRecurrenceType,
  FREQUENCY_LABELS,
  WEEKDAY_ABBREVIATIONS,
  DEFAULT_RECURRENCE_PATTERN,
  type RecurrencePattern,
} from '../../types/recurrence';
import { RecurrenceEngine } from '../../utils/recurrenceEngine';
import { cn } from '../../lib/utils';

interface RecurrenceConfigProps {
  value?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern | undefined) => void;
  eventStart: Date;
}

export const RecurrenceConfig: React.FC<RecurrenceConfigProps> = ({
  value,
  onChange,
  eventStart,
}) => {
  const [enabled, setEnabled] = useState(!!value);
  const [pattern, setPattern] = useState<RecurrencePattern>(
    value || DEFAULT_RECURRENCE_PATTERN,
  );
  const [validation, setValidation] = useState<string[]>([]);

  useEffect(() => {
    if (enabled) {
      const result = RecurrenceEngine.validatePattern(pattern);
      setValidation(result.errors || []);
    }
  }, [pattern, enabled]);

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (checked) {
      onChange(pattern);
    } else {
      onChange(undefined);
    }
  };

  const updatePattern = (updates: Partial<RecurrencePattern>) => {
    const newPattern = { ...pattern, ...updates };
    setPattern(newPattern);
    if (enabled) {
      onChange(newPattern);
    }
  };

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    const updates: Partial<RecurrencePattern> = { frequency };

    // Set default values based on frequency
    if (frequency === RecurrenceFrequency.WEEKLY) {
      updates.weekDays = [eventStart.getDay()];
    } else if (frequency === RecurrenceFrequency.MONTHLY) {
      updates.monthlyType = MonthlyRecurrenceType.DAY_OF_MONTH;
      updates.dayOfMonth = eventStart.getDate();
    }

    updatePattern(updates);
  };

  const handleWeekDayToggle = (day: WeekDay) => {
    const weekDays = pattern.weekDays || [];
    const newWeekDays = weekDays.includes(day)
      ? weekDays.filter((d) => d !== day)
      : [...weekDays, day].sort((a, b) => a - b);

    updatePattern({ weekDays: newWeekDays });
  };

  const getRecurrenceDescription = () => {
    if (!enabled) return '';
    return RecurrenceEngine.getRecurrenceDescription(pattern);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurrence-enabled"
          checked={enabled}
          onCheckedChange={handleEnabledChange}
        />
        <Label htmlFor="recurrence-enabled" className="flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Repeat Event
        </Label>
      </div>

      {enabled && (
        <>
          {/* Frequency Selection */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              <Select
                value={pattern.frequency}
                onValueChange={(value) =>
                  handleFrequencyChange(value as RecurrenceFrequency)
                }
              >
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Every</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={pattern.interval}
                  onChange={(e) =>
                    updatePattern({ interval: parseInt(e.target.value) || 1 })
                  }
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">
                  {pattern.frequency}
                  {pattern.interval > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Options */}
          {pattern.frequency === RecurrenceFrequency.WEEKLY && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex gap-1">
                {Object.entries(WEEKDAY_ABBREVIATIONS).map(([day, abbr]) => {
                  const dayNum = parseInt(day) as WeekDay;
                  const selected = pattern.weekDays?.includes(dayNum);
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={selected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleWeekDayToggle(dayNum)}
                      className={cn(
                        'w-10 h-10',
                        selected && 'bg-primary text-primary-foreground',
                      )}
                    >
                      {abbr}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Options */}
          {pattern.frequency === RecurrenceFrequency.MONTHLY && (
            <div className="space-y-2">
              <Label>Repeat by</Label>
              <RadioGroup
                value={
                  pattern.monthlyType || MonthlyRecurrenceType.DAY_OF_MONTH
                }
                onValueChange={(value) => {
                  const monthlyType = value as MonthlyRecurrenceType;
                  const updates: Partial<RecurrencePattern> = { monthlyType };

                  if (monthlyType === MonthlyRecurrenceType.DAY_OF_MONTH) {
                    updates.dayOfMonth = eventStart.getDate();
                  } else {
                    updates.dayOfWeek = eventStart.getDay() as WeekDay;
                    updates.weekOfMonth = Math.ceil(eventStart.getDate() / 7);
                  }

                  updatePattern(updates);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MonthlyRecurrenceType.DAY_OF_MONTH} />
                  <Label>Day of the month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={MonthlyRecurrenceType.DAY_OF_WEEK} />
                  <Label>Day of the week</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* End Options */}
          <div className="space-y-2">
            <Label>Ends</Label>
            <RadioGroup
              value={pattern.endType}
              onValueChange={(value) =>
                updatePattern({ endType: value as RecurrenceEndType })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RecurrenceEndType.NEVER} />
                <Label>Never</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RecurrenceEndType.ON_DATE} />
                <Label>On</Label>
                {pattern.endType === RecurrenceEndType.ON_DATE && (
                  <Input
                    type="date"
                    value={pattern.endDate?.split('T')[0] || ''}
                    onChange={(e) => updatePattern({ endDate: e.target.value })}
                    min={eventStart.toISOString().split('T')[0]}
                    className="ml-2"
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RecurrenceEndType.AFTER_OCCURRENCES} />
                <Label>After</Label>
                {pattern.endType === RecurrenceEndType.AFTER_OCCURRENCES && (
                  <div className="flex items-center gap-2 ml-2">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={pattern.occurrences || 1}
                      onChange={(e) =>
                        updatePattern({
                          occurrences: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      occurrences
                    </span>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Recurrence Summary */}
          {getRecurrenceDescription() && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{getRecurrenceDescription()}</span>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validation.length > 0 && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md">
              <ul className="text-sm space-y-1">
                {validation.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
