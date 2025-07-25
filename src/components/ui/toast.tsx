import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FadeIn, ScaleIn } from './animated';
import { useThemeContext } from '../ThemeProvider';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useThemeContext();

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 150); // Wait for animation
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    const iconClass = 'h-5 w-5 transition-transform duration-200';
    switch (toast.type) {
      case 'success':
        return (
          <CheckCircle
            className={cn(iconClass)}
            style={{ color: theme.colors.success.main }}
          />
        );
      case 'error':
        return (
          <XCircle
            className={cn(iconClass)}
            style={{ color: theme.colors.error.main }}
          />
        );
      case 'warning':
        return (
          <AlertTriangle
            className={cn(iconClass)}
            style={{ color: theme.colors.warning.main }}
          />
        );
      case 'info':
      default:
        return (
          <Info
            className={cn(iconClass)}
            style={{ color: theme.colors.primary.main }}
          />
        );
    }
  };

  const getToastStyles = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surfaceElevated,
      boxShadow: theme.colors.shadow.lg,
      borderRadius: theme.borderRadius.lg,
    };

    switch (toast.type) {
      case 'success':
        return { ...baseStyle, borderLeftColor: theme.colors.success.main };
      case 'error':
        return { ...baseStyle, borderLeftColor: theme.colors.error.main };
      case 'warning':
        return { ...baseStyle, borderLeftColor: theme.colors.warning.main };
      case 'info':
      default:
        return { ...baseStyle, borderLeftColor: theme.colors.primary.main };
    }
  };

  return (
    <FadeIn direction="right" trigger={isVisible} duration={200}>
      <ScaleIn duration={150}>
        <div
          className={cn(
            'border-l-4 p-4 max-w-sm mb-2 transition-all duration-200',
            'hover:scale-105 hover:shadow-xl cursor-pointer',
          )}
          style={getToastStyles()}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="ml-3 flex-1">
              <h3
                className="font-medium text-sm transition-colors duration-200"
                style={{ color: theme.colors.text.primary }}
              >
                {toast.title}
              </h3>
              {toast.description && (
                <p
                  className="text-xs mt-1 transition-colors duration-200"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onRemove(toast.id), 150);
              }}
              className={cn(
                'ml-2 p-1 rounded-md transition-all duration-150',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1',
              )}
              style={{
                color: theme.colors.text.muted,
              }}
              aria-label="Close notification"
            >
              <X className="h-4 w-4 transition-transform duration-150 hover:rotate-90" />
            </button>
          </div>
        </div>
      </ScaleIn>
    </FadeIn>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

// Toast hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, description?: string) => {
    addToast({ type: 'success', title, description });
  };

  const error = (title: string, description?: string) => {
    addToast({ type: 'error', title, description });
  };

  const info = (title: string, description?: string) => {
    addToast({ type: 'info', title, description });
  };

  const warning = (title: string, description?: string) => {
    addToast({ type: 'warning', title, description });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
};
