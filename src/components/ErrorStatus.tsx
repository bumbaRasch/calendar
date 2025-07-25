import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { errorLogger } from '../lib/errorLogger';
import type { ErrorDetails } from '../lib/errorLogger';

interface ErrorStatusProps {
  onClose?: () => void;
  maxErrors?: number;
}

export const ErrorStatus: React.FC<ErrorStatusProps> = ({
  onClose,
  maxErrors = 5,
}) => {
  const [criticalErrors, setCriticalErrors] = useState<ErrorDetails[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkCriticalErrors = () => {
      const errors = errorLogger.getCriticalErrors();
      setCriticalErrors(errors.slice(-maxErrors));
      setIsVisible(errors.length > 0);
    };

    // Check immediately
    checkCriticalErrors();

    // Check periodically
    const interval = setInterval(checkCriticalErrors, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [maxErrors]);

  const handleClearErrors = () => {
    errorLogger.clearCriticalErrors();
    setCriticalErrors([]);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isVisible || criticalErrors.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-w-[90vw] border-destructive shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-sm">System Errors</h3>
            <Badge variant="destructive" className="text-xs">
              {criticalErrors.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {criticalErrors.map((error) => (
            <div
              key={error.errorId}
              className="p-2 rounded border bg-muted/50 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(error.severity)}
                  <Badge
                    variant={
                      getSeverityColor(error.severity) as
                        | 'destructive'
                        | 'secondary'
                        | 'outline'
                    }
                    className="text-xs"
                  >
                    {error.severity.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(error.timestamp)}
                </span>
              </div>

              <p className="text-xs font-medium mb-1 truncate">
                {error.component && `[${error.component}] `}
                {error.message}
              </p>

              <p className="text-xs text-muted-foreground">
                ID: {error.errorId}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearErrors}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Reload App
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Errors are automatically reported for investigation
        </p>
      </CardContent>
    </Card>
  );
};
