import { Component } from 'react';
import type { ReactNode } from 'react';
import type { ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class CalendarErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring
    this.logError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.group('🚨 Calendar Error Boundary');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error Info:', errorInfo);
      // eslint-disable-next-line no-console
      console.error('Error Details:', errorDetails);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // In production, send to error monitoring service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // window.errorReporting?.captureException(error, {
      //   tags: { component: 'Calendar' },
      //   extra: errorDetails,
      // });
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  private handleReset = () => {
    // Clear any persisted calendar state that might be causing issues
    try {
      localStorage.removeItem('calendar-events');
      localStorage.removeItem('calendar-view');
      localStorage.removeItem('calendar-filters');
    } catch (_e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to clear calendar storage:', _e);
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  private getErrorMessage = (error: Error): string => {
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load calendar resources. This might be due to a network issue or an app update.';
    }
    if (error.message.includes('Cannot read properties')) {
      return 'Calendar data appears to be corrupted. Try refreshing or clearing your calendar data.';
    }
    if (error.message.includes('FullCalendar')) {
      return 'Calendar component encountered an error. Some features may not work correctly.';
    }
    return 'An unexpected error occurred in the calendar component.';
  };

  private renderErrorFallback = () => {
    const { error, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;
    const errorMessage = error ? this.getErrorMessage(error) : 'Unknown error';

    return (
      <Card className="mx-auto max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Calendar Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again ({this.maxRetries - retryCount} left)
              </Button>
            )}

            <Button
              onClick={this.handleReset}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Reset Calendar
            </Button>
          </div>

          {!canRetry && (
            <p className="text-xs text-muted-foreground">
              Maximum retry attempts reached. Please refresh the page or reset
              your calendar data.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorFallback();
    }

    return this.props.children;
  }
}

export default CalendarErrorBoundary;
