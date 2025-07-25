import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className,
  onValueChange,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
        'text-sm ring-offset-background focus:outline-none focus:ring-2',
        'focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed',
        'disabled:opacity-50',
        className,
      )}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
};
