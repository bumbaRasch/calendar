import type { ErrorInfo } from 'react';

export interface ErrorDetails {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export interface ErrorReportingService {
  captureException(
    error: Error,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      level?: 'error' | 'warning' | 'info';
    },
  ): void;
  captureMessage(message: string, level?: 'error' | 'warning' | 'info'): void;
  setUser(user: { id: string; username?: string; email?: string }): void;
  setTag(key: string, value: string): void;
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'error' | 'warning' | 'info' | 'debug';
    data?: Record<string, unknown>;
  }): void;
}

class ErrorLogger {
  private sessionId: string;
  private userId?: string;
  private reportingService?: ErrorReportingService;
  private breadcrumbs: Array<{
    message: string;
    category?: string;
    level?: string;
    timestamp: string;
    data?: Record<string, unknown>;
  }> = [];
  private maxBreadcrumbs = 20;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeGlobalErrorHandlers(): void {
    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      this.logError(new Error(event.message), {
        component: 'Global',
        severity: 'critical',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        {
          component: 'Global',
          severity: 'high',
          context: {
            reason: event.reason,
            promise: event.promise,
          },
        },
      );
    });
  }

  setReportingService(service: ErrorReportingService): void {
    this.reportingService = service;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.reportingService?.setUser({ id: userId });
  }

  addBreadcrumb(
    message: string,
    category = 'action',
    level: 'error' | 'warning' | 'info' | 'debug' = 'info',
    data?: Record<string, unknown>,
  ): void {
    const breadcrumb = {
      message,
      category,
      level,
      timestamp: new Date().toISOString(),
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last maxBreadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }

    this.reportingService?.addBreadcrumb({
      message,
      category,
      level,
      data,
    });
  }

  private getSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();

    if (
      message.includes('chunkloa') ||
      message.includes('script error') ||
      message.includes('network error')
    ) {
      return 'critical';
    }
    if (message.includes('validation') || message.includes('permission')) {
      return 'medium';
    }
    if (message.includes('storage') || message.includes('quota')) {
      return 'high';
    }
    return 'high'; // Default to high for unknown errors
  }

  private getStorageInfo(): Record<string, unknown> {
    try {
      const info: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('calendar-') || key?.startsWith('ui-')) {
          try {
            const value = localStorage.getItem(key);
            info[key] = value ? JSON.parse(value) : null;
          } catch (_e) {
            info[key] = 'Failed to parse';
          }
        }
      }
      return info;
    } catch (_e) {
      return { error: 'Failed to read localStorage' };
    }
  }

  logError(
    error: Error,
    options: {
      component?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      context?: Record<string, unknown>;
      tags?: Record<string, string>;
      errorInfo?: ErrorInfo;
    } = {},
  ): void {
    const errorId =
      Date.now().toString(36) + Math.random().toString(36).substr(2);
    const severity = options.severity || this.getSeverity(error);

    const errorDetails: ErrorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: options.errorInfo?.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      component: options.component,
      severity,
      context: {
        ...options.context,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        storage: this.getStorageInfo(),
        breadcrumbs: this.breadcrumbs,
      },
      tags: options.tags,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji =
        severity === 'critical'
          ? '🚨'
          : severity === 'high'
            ? '⚠️'
            : severity === 'medium'
              ? '⚡'
              : '💡';

      // eslint-disable-next-line no-console
      console.group(`${emoji} Error Logger - ${severity.toUpperCase()}`);
      // eslint-disable-next-line no-console
      console.error('Error ID:', errorId);
      // eslint-disable-next-line no-console
      console.error('Component:', options.component || 'Unknown');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error Info:', options.errorInfo);
      // eslint-disable-next-line no-console
      console.error('Context:', options.context);
      // eslint-disable-next-line no-console
      console.error('Full Details:', errorDetails);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // Send to production error reporting service
    if (process.env.NODE_ENV === 'production' && this.reportingService) {
      this.reportingService.captureException(error, {
        tags: {
          component: options.component || 'Unknown',
          severity,
          errorId,
          sessionId: this.sessionId,
          ...options.tags,
        },
        extra: errorDetails as unknown as Record<string, unknown>,
        level: severity === 'critical' ? 'error' : 'warning',
      });
    }

    // Store critical errors locally for offline support
    if (severity === 'critical') {
      try {
        const criticalErrors = JSON.parse(
          localStorage.getItem('critical-errors') || '[]',
        );
        criticalErrors.push(errorDetails);

        // Keep only last 10 critical errors
        if (criticalErrors.length > 10) {
          criticalErrors.splice(0, criticalErrors.length - 10);
        }

        localStorage.setItem('critical-errors', JSON.stringify(criticalErrors));
      } catch (_e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to store critical error locally:', _e);
      }
    }
  }

  logInfo(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('ℹ️ Info:', message, context);
    }

    this.addBreadcrumb(message, 'info', 'info', context);
    this.reportingService?.captureMessage(message, 'info');
  }

  logWarning(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('⚠️ Warning:', message, context);
    }

    this.addBreadcrumb(message, 'warning', 'warning', context);
    this.reportingService?.captureMessage(message, 'warning');
  }

  getCriticalErrors(): ErrorDetails[] {
    try {
      return JSON.parse(localStorage.getItem('critical-errors') || '[]');
    } catch (_e) {
      return [];
    }
  }

  clearCriticalErrors(): void {
    try {
      localStorage.removeItem('critical-errors');
    } catch (_e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to clear critical errors:', _e);
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getBreadcrumbs(): typeof this.breadcrumbs {
    return [...this.breadcrumbs];
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger();

// Export default
export default errorLogger;
