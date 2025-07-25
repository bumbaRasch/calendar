import { useCallback } from 'react';
import { errorLogger } from '../lib/errorLogger';
import type { ErrorInfo } from 'react';

interface UseErrorHandlerOptions {
  component?: string;
  defaultSeverity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorHandlerMethods {
  handleError: (
    error: Error,
    options?: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      context?: Record<string, unknown>;
      tags?: Record<string, string>;
      errorInfo?: ErrorInfo;
    },
  ) => void;
  handleAsyncError: (
    asyncFn: () => Promise<unknown>,
    options?: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      context?: Record<string, unknown>;
      tags?: Record<string, string>;
      onError?: (error: Error) => void;
    },
  ) => Promise<unknown>;
  logInfo: (message: string, context?: Record<string, unknown>) => void;
  logWarning: (message: string, context?: Record<string, unknown>) => void;
  addBreadcrumb: (
    message: string,
    category?: string,
    level?: 'error' | 'warning' | 'info' | 'debug',
    data?: Record<string, unknown>,
  ) => void;
}

export const useErrorHandler = (
  options: UseErrorHandlerOptions = {},
): ErrorHandlerMethods => {
  const { component, defaultSeverity = 'high' } = options;

  const handleError = useCallback(
    (
      error: Error,
      errorOptions: {
        severity?: 'low' | 'medium' | 'high' | 'critical';
        context?: Record<string, unknown>;
        tags?: Record<string, string>;
        errorInfo?: ErrorInfo;
      } = {},
    ) => {
      errorLogger.logError(error, {
        component,
        severity: errorOptions.severity || defaultSeverity,
        context: errorOptions.context,
        tags: errorOptions.tags,
        errorInfo: errorOptions.errorInfo,
      });
    },
    [component, defaultSeverity],
  );

  const handleAsyncError = useCallback(
    async (
      asyncFn: () => Promise<unknown>,
      asyncOptions: {
        severity?: 'low' | 'medium' | 'high' | 'critical';
        context?: Record<string, unknown>;
        tags?: Record<string, string>;
        onError?: (error: Error) => void;
      } = {},
    ) => {
      try {
        return await asyncFn();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        handleError(err, {
          severity: asyncOptions.severity,
          context: asyncOptions.context,
          tags: asyncOptions.tags,
        });

        // Call custom error handler if provided
        asyncOptions.onError?.(err);

        // Re-throw the error so the caller can handle it
        throw err;
      }
    },
    [handleError],
  );

  const logInfo = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      errorLogger.addBreadcrumb(message, component || 'info', 'info', context);
      errorLogger.logInfo(`[${component || 'App'}] ${message}`, context);
    },
    [component],
  );

  const logWarning = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      errorLogger.addBreadcrumb(
        message,
        component || 'warning',
        'warning',
        context,
      );
      errorLogger.logWarning(`[${component || 'App'}] ${message}`, context);
    },
    [component],
  );

  const addBreadcrumb = useCallback(
    (
      message: string,
      category = 'action',
      level: 'error' | 'warning' | 'info' | 'debug' = 'info',
      data?: Record<string, unknown>,
    ) => {
      errorLogger.addBreadcrumb(
        `[${component || 'App'}] ${message}`,
        category,
        level,
        data,
      );
    },
    [component],
  );

  return {
    handleError,
    handleAsyncError,
    logInfo,
    logWarning,
    addBreadcrumb,
  };
};
