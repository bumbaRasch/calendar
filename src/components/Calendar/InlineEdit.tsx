import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Edit3 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  validate?: (value: string) => string | null;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className,
  maxLength,
  multiline = false,
  rows = 1,
  disabled = false,
  required = false,
  validate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();

    // Validation
    if (required && !trimmedValue) {
      setError('This field is required');
      return;
    }

    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }

    setIsEditing(false);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking save button
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 100);
  };

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';

    return (
      <div className="flex items-start gap-2 w-full">
        <div className="flex-1">
          <InputComponent
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={multiline ? rows : undefined}
            className={cn(
              'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              multiline && 'resize-none',
              error && 'border-red-500',
              className,
            )}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          {maxLength && (
            <p
              className={cn(
                'text-xs mt-1',
                editValue.length > maxLength * 0.9
                  ? 'text-red-500'
                  : 'text-gray-500',
              )}
            >
              {editValue.length}/{maxLength}
            </p>
          )}
        </div>
        <div className="flex gap-1 mt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={handleStartEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartEdit();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="Click to edit"
    >
      <span className={cn('flex-1 text-sm', !value && 'text-gray-400 italic')}>
        {value || placeholder}
      </span>
      {!disabled && (
        <Edit3 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};
