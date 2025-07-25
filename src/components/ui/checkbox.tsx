import React from 'react';
import { cn } from '../../lib/utils';

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  className,
  onCheckedChange,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };

  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-gray-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
};
