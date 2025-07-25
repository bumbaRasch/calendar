import { Component } from 'react';
import type { ReactNode } from 'react';
import type { ErrorInfo } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onClose?: () => void;
  dialogTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class DialogErrorBoundary extends Component<Props, State> {
  private maxRetries = 2;

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
      dialogTitle: this.props.dialogTitle,
      retryCount: this.state.retryCount,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.group('🚨 Dialog Error Boundary');
      // eslint-disable-next-line no-console
      console.error('Dialog:', this.props.dialogTitle || 'Unknown');
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
      //   tags: { component: 'Dialog', dialog: this.props.dialogTitle },
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

  private handleClose = () => {
    // Reset error state when closing
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });

    // Call the provided close handler
    this.props.onClose?.();
  };

  private getErrorMessage = (error: Error): string => {
    if (error.message.includes('validation')) {
      return 'Form validation failed. Please check your input and try again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error occurred while processing your request.';
    }
    if (error.message.includes('storage') || error.message.includes('quota')) {
      return 'Storage error occurred. Your browser storage might be full.';
    }
    if (error.message.includes('permission')) {
      return 'Permission denied. You might not have the required permissions.';
    }
    return 'An unexpected error occurred in this dialog.';
  };

  private renderErrorFallback = () => {
    const { error, retryCount } = this.state;
    const { dialogTitle, onClose } = this.props;
    const canRetry = retryCount < this.maxRetries;
    const errorMessage = error ? this.getErrorMessage(error) : 'Unknown error';

    return (
      <Card className="mx-auto max-w-sm border-destructive">
        <CardHeader className="relative">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={this.handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-center text-destructive">
            {dialogTitle ? `${dialogTitle} Error` : 'Dialog Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-3 text-left">
              <summary className="cursor-pointer text-xs font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
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

            {onClose && (
              <Button onClick={this.handleClose} variant="default" size="sm">
                Close Dialog
              </Button>
            )}
          </div>

          {!canRetry && !onClose && (
            <p className="text-xs text-muted-foreground">
              Maximum retry attempts reached. Please close this dialog and try
              again.
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

export default DialogErrorBoundary;
