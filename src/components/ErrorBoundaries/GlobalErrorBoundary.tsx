import { Component } from 'react';
import type { ReactNode } from 'react';
import type { ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
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
  errorId: string;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
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
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      localStorage: this.getLocalStorageInfo(),
      sessionStorage: this.getSessionStorageInfo(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.group('🚨 Global Error Boundary');
      // eslint-disable-next-line no-console
      console.error('Error ID:', this.state.errorId);
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
    if (process.env.NODE_ENV === 'production') {
      // window.errorReporting?.captureException(error, {
      //   tags: {
      //     component: 'GlobalErrorBoundary',
      //     errorId: this.state.errorId,
      //     severity: 'critical'
      //   },
      //   extra: errorDetails,
      // });
      // Also send to your analytics service
      // window.analytics?.track('Global Error', errorDetails);
    }
  };

  private getLocalStorageInfo = (): Record<string, unknown> => {
    try {
      const info: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('calendar-') || key?.startsWith('ui-')) {
          const value = localStorage.getItem(key);
          info[key] = value ? JSON.parse(value) : null;
        }
      }
      return info;
    } catch (_e) {
      return { error: 'Failed to read localStorage' };
    }
  };

  private getSessionStorageInfo = (): Record<string, unknown> => {
    try {
      const info: Record<string, unknown> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('calendar-') || key?.startsWith('ui-')) {
          const value = sessionStorage.getItem(key);
          info[key] = value ? JSON.parse(value) : null;
        }
      }
      return info;
    } catch (_e) {
      return { error: 'Failed to read sessionStorage' };
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearData = () => {
    try {
      // Clear application data that might be causing issues
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('calendar-') || key?.startsWith('ui-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear session storage
      sessionStorage.clear();

      // Reload the page
      window.location.reload();
    } catch (_e) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear data:', _e);
      // Force reload even if clearing fails
      window.location.reload();
    }
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error?.message || 'Unknown error'}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Steps to reproduce:
1. 
2. 
3. 

Additional context:
[Please describe what you were doing when this error occurred]

Stack trace:
${error?.stack || 'Not available'}
    `);

    // Replace with your actual bug reporting email or system
    const mailto = `mailto:support@example.com?subject=${subject}&body=${body}`;
    window.open(mailto);
  };

  private getErrorSeverity = (error: Error): 'critical' | 'high' | 'medium' => {
    const message = error.message.toLowerCase();

    if (message.includes('chunkloa') || message.includes('script error')) {
      return 'critical';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    return 'high';
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('chunkloa')) {
      return 'The application failed to load properly. This might be due to a network issue or an app update.';
    }
    if (message.includes('script error')) {
      return 'A critical script error occurred. The application may not function correctly.';
    }
    if (message.includes('out of memory')) {
      return 'The application ran out of memory. Try closing other tabs or applications.';
    }
    if (message.includes('network')) {
      return 'A network error occurred. Please check your internet connection.';
    }
    return 'An unexpected error occurred that prevented the application from working properly.';
  };

  private renderErrorFallback = () => {
    const { error, errorId } = this.state;
    const severity = error ? this.getErrorSeverity(error) : 'high';
    const errorMessage = error ? this.getErrorMessage(error) : 'Unknown error';

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="mx-auto max-w-lg border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">
              Application Error
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Error ID:{' '}
              <code className="rounded bg-muted px-1 text-xs">{errorId}</code>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Severity:{' '}
                <span
                  className={`font-medium ${
                    severity === 'critical'
                      ? 'text-red-600'
                      : severity === 'high'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {severity.toUpperCase()}
                </span>
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-xs font-medium">Error Message:</p>
                    <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                      {error.message}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Stack Trace:</p>
                    <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                      {error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                onClick={this.handleReload}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>

              <Button
                onClick={this.handleClearData}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Clear Data & Reload
              </Button>

              <Button
                onClick={this.handleReportBug}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-xs"
              >
                <Bug className="h-4 w-4" />
                Report Bug
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                If this error persists, try clearing your browser cache or
                contact support with Error ID: {errorId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorFallback();
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
