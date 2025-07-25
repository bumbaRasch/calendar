import React, { useState, useCallback, useEffect } from 'react';
import { Printer, Calendar, FileText, Settings, X, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useThemeContext } from '../ThemeProvider';
import { cn } from '../../lib/utils';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  currentView: string;
  dateRange: {
    start: Date;
    end: Date;
    title: string;
  };
}

export interface PrintOptions {
  view: 'current' | 'month' | 'week' | 'day' | 'list';
  dateRange: 'current' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeWeekends: boolean;
  includeEventDetails: boolean;
  includeColors: boolean;
  paperSize: 'A4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  eventCategories: string[];
  showHeader: boolean;
  showFooter: boolean;
  fontSize: 'small' | 'normal' | 'large';
}

const defaultOptions: PrintOptions = {
  view: 'current',
  dateRange: 'current',
  includeWeekends: true,
  includeEventDetails: true,
  includeColors: true,
  paperSize: 'A4',
  orientation: 'portrait',
  eventCategories: [
    'work',
    'personal',
    'meeting',
    'deadline',
    'holiday',
    'other',
  ],
  showHeader: true,
  showFooter: true,
  fontSize: 'normal',
};

const viewOptions = [
  { value: 'current', label: 'Current View', icon: Eye },
  { value: 'month', label: 'Month View', icon: Calendar },
  { value: 'week', label: 'Week View', icon: Calendar },
  { value: 'day', label: 'Day View', icon: Calendar },
  { value: 'list', label: 'List View', icon: FileText },
];

const categoryOptions = [
  { value: 'work', label: 'Work', color: '#2563eb' },
  { value: 'personal', label: 'Personal', color: '#dc2626' },
  { value: 'meeting', label: 'Meeting', color: '#16a34a' },
  { value: 'deadline', label: 'Deadline', color: '#ea580c' },
  { value: 'holiday', label: 'Holiday', color: '#7c3aed' },
  { value: 'other', label: 'Other', color: '#6b7280' },
];

export const PrintDialog: React.FC<PrintDialogProps> = ({
  isOpen,
  onClose,
  onPrint,
  currentView,
  dateRange,
}) => {
  const { theme } = useThemeContext();
  const [options, setOptions] = useState<PrintOptions>(defaultOptions);

  // Handle escape key to close dialog
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Update default view when current view changes
  useEffect(() => {
    if (isOpen) {
      setOptions((prev) => ({
        ...prev,
        view: 'current',
      }));
    }
  }, [currentView, isOpen]);

  const handleOptionChange = useCallback(
    <K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleCategoryToggle = useCallback((category: string) => {
    setOptions((prev) => ({
      ...prev,
      eventCategories: prev.eventCategories.includes(category)
        ? prev.eventCategories.filter((c) => c !== category)
        : [...prev.eventCategories, category],
    }));
  }, []);

  const handlePrint = useCallback(() => {
    onPrint(options);
    onClose();
  }, [options, onPrint, onClose]);

  const handlePreview = useCallback(() => {
    onPrint({ ...options, preview: true } as any);
  }, [options, onPrint]);

  if (!isOpen) return null;

  const getCurrentViewLabel = () => {
    switch (currentView) {
      case 'dayGridMonth':
        return 'Month';
      case 'timeGridWeek':
        return 'Week';
      case 'timeGridDay':
        return 'Day';
      case 'listWeek':
        return 'List';
      default:
        return 'Current';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      role="button"
      aria-label="Close dialog"
      tabIndex={0}
    >
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl',
          'overflow-hidden',
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border.default,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border.muted,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: theme.colors.primary.main + '20' }}
            >
              <Printer
                className="h-6 w-6"
                style={{ color: theme.colors.primary.main }}
              />
            </div>
            <div>
              <h2
                id="print-dialog-title"
                className="text-xl font-semibold"
                style={{ color: theme.colors.text.primary }}
              >
                Print Calendar
              </h2>
              <p className="text-sm" style={{ color: theme.colors.text.muted }}>
                Customize your calendar print settings
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
            style={{ color: theme.colors.text.muted }}
            aria-label="Close print dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto p-6 space-y-6"
          style={{ maxHeight: 'calc(90vh - 180px)' }}
        >
          {/* Current selection info */}
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border.muted,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar
                className="h-4 w-4"
                style={{ color: theme.colors.primary.main }}
              />
              <span
                className="font-medium text-sm"
                style={{ color: theme.colors.text.primary }}
              >
                Current Selection
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary">{getCurrentViewLabel()} View</Badge>
              <Badge variant="outline">{dateRange.title}</Badge>
            </div>
          </div>

          {/* View Options */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: theme.colors.text.primary }}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              View to Print
            </label>
            <RadioGroup
              value={options.view}
              onValueChange={(value: string) =>
                handleOptionChange('view', value as any)
              }
              className="space-y-2"
            >
              {viewOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`view-${option.value}`}
                  />
                  <label
                    htmlFor={`view-${option.value}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ color: theme.colors.text.primary }}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                    {option.value === 'current' && (
                      <Badge variant="secondary" className="text-xs">
                        {getCurrentViewLabel()}
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Paper Size
              </label>
              <Select
                value={options.paperSize}
                onValueChange={(value: string) =>
                  handleOptionChange('paperSize', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Orientation
              </label>
              <Select
                value={options.orientation}
                onValueChange={(value: string) =>
                  handleOptionChange('orientation', value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: theme.colors.text.primary }}
            >
              Content Options
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-weekends"
                  checked={options.includeWeekends}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeWeekends', !!checked)
                  }
                />
                <label
                  htmlFor="include-weekends"
                  className="text-sm cursor-pointer"
                  style={{ color: theme.colors.text.primary }}
                >
                  Include weekends
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-details"
                  checked={options.includeEventDetails}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeEventDetails', !!checked)
                  }
                />
                <label
                  htmlFor="include-details"
                  className="text-sm cursor-pointer"
                  style={{ color: theme.colors.text.primary }}
                >
                  Include event details
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-colors"
                  checked={options.includeColors}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeColors', !!checked)
                  }
                />
                <label
                  htmlFor="include-colors"
                  className="text-sm cursor-pointer"
                  style={{ color: theme.colors.text.primary }}
                >
                  Include category colors
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-header"
                  checked={options.showHeader}
                  onCheckedChange={(checked) =>
                    handleOptionChange('showHeader', !!checked)
                  }
                />
                <label
                  htmlFor="show-header"
                  className="text-sm cursor-pointer"
                  style={{ color: theme.colors.text.primary }}
                >
                  Show header with title and date
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-footer"
                  checked={options.showFooter}
                  onCheckedChange={(checked) =>
                    handleOptionChange('showFooter', !!checked)
                  }
                />
                <label
                  htmlFor="show-footer"
                  className="text-sm cursor-pointer"
                  style={{ color: theme.colors.text.primary }}
                >
                  Show footer with print date
                </label>
              </div>
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: theme.colors.text.primary }}
            >
              Event Categories to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={options.eventCategories.includes(category.value)}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ color: theme.colors.text.primary }}
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border.muted,
          }}
        >
          <div className="text-sm" style={{ color: theme.colors.text.muted }}>
            Print settings will be applied to the selected view
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>

            <Button
              onClick={handlePrint}
              className="flex items-center gap-2"
              style={{
                backgroundColor: theme.colors.primary.main,
                color: theme.colors.primary.text,
              }}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
