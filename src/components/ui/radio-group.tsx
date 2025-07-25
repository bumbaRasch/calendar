import React, { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  children,
  className,
  name,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
};

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
}

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({
  value,
  className,
  ...props
}) => {
  const {
    value: groupValue,
    onValueChange,
    name,
  } = useContext(RadioGroupContext);

  return (
    <input
      type="radio"
      value={value}
      checked={groupValue === value}
      onChange={() => onValueChange?.(value)}
      name={name}
      className={cn(
        'h-4 w-4 border-gray-300 text-primary-600',
        'focus:ring-primary-500 focus:ring-2 focus:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
};
