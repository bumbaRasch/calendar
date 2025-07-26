import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(
  undefined,
);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className={cn('relative', className)}>{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSelectContext();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border',
        'border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2',
        'focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed',
        'disabled:opacity-50',
        className,
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue: React.FC<{
  placeholder?: string;
  className?: string;
}> = ({ placeholder, className }) => {
  const { value } = useSelectContext();

  return (
    <span className={cn('block truncate', className)}>
      {value || placeholder}
    </span>
  );
};

export const SelectContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSelectContext();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close dropdown"
      />
      <div
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border',
          'bg-popover p-1 text-popover-foreground shadow-md animate-in',
          'fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2 top-full mt-1 w-full',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = useSelectContext();

  const handleSelect = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div
      role="option"
      aria-selected={selectedValue === value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={cn(
        'relative flex w-full cursor-default select-none items-center',
        'rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'hover:bg-accent hover:text-accent-foreground cursor-pointer',
        className,
      )}
      onClick={handleSelect}
    >
      {children}
    </div>
  );
};
