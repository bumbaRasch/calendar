# Error Boundaries Documentation

This directory contains comprehensive error handling components for the Calendar application,
implementing React's Error Boundary pattern with modern best practices.

## Components Overview

### 1. GlobalErrorBoundary

**Location**: `GlobalErrorBoundary.tsx` **Purpose**: Catches unhandled errors at the application
level **Usage**: Wraps the entire application in `__root.tsx`

**Features**:

- Full-screen error display for critical failures
- Error ID generation for support
- User-friendly error messages based on error type
- Recovery actions (reload, go home, clear data, report bug)
- Comprehensive error logging with context
- localStorage/sessionStorage analysis
- Browser and environment information capture

### 2. CalendarErrorBoundary

**Location**: `CalendarErrorBoundary.tsx` **Purpose**: Handles errors specific to calendar
components **Usage**: Wraps the main Calendar component

**Features**:

- Calendar-specific error handling
- Retry mechanism (3 attempts)
- Calendar data reset functionality
- FullCalendar error detection
- Network and data corruption handling
- Fallback UI with calendar icon

### 3. DialogErrorBoundary

**Location**: `DialogErrorBoundary.tsx`  
**Purpose**: Handles errors in modal dialogs and forms **Usage**: Wraps dialog content in
EventDialog

**Features**:

- Form validation error handling
- Network error detection
- Storage quota error handling
- Permission error handling
- Retry mechanism (2 attempts)
- Dialog context preservation

## Error Logging System

### ErrorLogger (`/src/lib/errorLogger.ts`)

Centralized error logging and reporting system.

**Key Features**:

- Session tracking with unique IDs
- Breadcrumb trail for debugging
- Severity classification (low, medium, high, critical)
- Local storage of critical errors
- Global error and promise rejection handlers
- Context capture (viewport, storage, user agent)
- Production-ready integration points for external services

**Severity Levels**:

- **Critical**: App-breaking errors (chunk load, script errors)
- **High**: Component failures, unknown errors
- **Medium**: Validation, permission errors
- **Low**: Minor issues, warnings

### useErrorHandler Hook (`/src/hooks/useErrorHandler.ts`)

React hook for easy error handling in components.

**Methods**:

- `handleError()` - Log errors with context
- `handleAsyncError()` - Wrap async operations
- `logInfo()` - Information logging
- `logWarning()` - Warning logging
- `addBreadcrumb()` - Add debug breadcrumbs

## Error Status Component

### ErrorStatus (`/src/components/ErrorStatus.tsx`)

Displays critical errors to users in real-time.

**Features**:

- Fixed bottom-right overlay
- Critical error count badge
- Error details with timestamps
- Clear all errors functionality
- Auto-refresh every 30 seconds
- Severity-based icons and colors

## Integration Points

### Current Integrations

1. **Root Level**: GlobalErrorBoundary wraps entire app
2. **Calendar**: CalendarErrorBoundary wraps calendar component
3. **Dialogs**: DialogErrorBoundary wraps EventDialog
4. **Layout**: ErrorStatus component in MainLayout

### Usage Examples

#### Basic Error Logging

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const MyComponent = () => {
  const { handleError, logInfo } = useErrorHandler({
    component: 'MyComponent',
  });

  const handleAction = async () => {
    try {
      logInfo('Starting action');
      await someAsyncOperation();
    } catch (error) {
      handleError(error, {
        context: { action: 'handleAction' },
        severity: 'high',
      });
    }
  };
};
```

#### Async Error Handling

```typescript
const { handleAsyncError } = useErrorHandler({
  component: 'DataLoader',
});

const loadData = handleAsyncError(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  {
    context: { endpoint: '/api/data' },
    onError: (error) => {
      setLoadingError(true);
    },
  },
);
```

## Production Integration

### External Error Reporting

The error logger supports integration with services like Sentry, LogRocket, or Bugsnag:

```typescript
import { errorLogger } from '@/lib/errorLogger';

// Set up external reporting service
errorLogger.setReportingService({
  captureException: (error, context) => {
    Sentry.captureException(error, context);
  },
  captureMessage: (message, level) => {
    Sentry.captureMessage(message, level);
  },
  setUser: (user) => {
    Sentry.setUser(user);
  },
  // ... other methods
});
```

### User Authentication

```typescript
// Set user ID for error tracking
errorLogger.setUserId('user-123');
```

## Error Recovery Strategies

### Automatic Recovery

1. **Retry Mechanisms**: Built into error boundaries
2. **Data Reset**: Clear corrupted localStorage data
3. **Component Remounting**: Reset component state
4. **Graceful Degradation**: Fallback UI components

### User-Initiated Recovery

1. **Reload Page**: Full application restart
2. **Clear Data**: Remove cached data
3. **Reset Calendar**: Calendar-specific data reset
4. **Report Bug**: Email bug report with error details

## Development vs Production

### Development Mode

- Full error details in console
- Component stack traces
- Technical error information
- Verbose logging

### Production Mode

- User-friendly error messages
- External error reporting
- Critical error persistence
- Minimal console output

## Error Boundary Best Practices

### Do's

✅ Wrap components that may fail ✅ Provide meaningful fallback UI ✅ Log errors with sufficient
context ✅ Implement retry mechanisms ✅ Show user-friendly error messages ✅ Preserve user data
when possible

### Don'ts

❌ Don't catch errors in event handlers (use try/catch) ❌ Don't render error boundaries inside
other error boundaries unnecessarily ❌ Don't suppress errors without logging ❌ Don't show
technical details to end users ❌ Don't forget to handle async errors separately

## Testing Error Boundaries

### Manual Testing

```typescript
// Add to component for testing
if (process.env.NODE_ENV === 'development') {
  if (window.location.search.includes('test-error')) {
    throw new Error('Test error boundary');
  }
}
```

### Error Simulation

Visit `http://localhost:3000/?test-error=calendar` to test different error scenarios.

## Monitoring and Alerts

### Key Metrics to Monitor

- Error frequency by component
- Error severity distribution
- User recovery success rates
- Critical error persistence
- Browser/device error patterns

### Alert Conditions

- Critical error rate > 1% of sessions
- Multiple errors from same user
- New error types not seen before
- Error rate increase > 50% over baseline

## Future Enhancements

### Planned Features

- [ ] Error boundary testing utilities
- [ ] Custom recovery strategies per component
- [ ] Error analytics dashboard
- [ ] A/B testing for error messages
- [ ] Offline error sync
- [ ] Error trend analysis

### Integration Opportunities

- [ ] Performance monitoring correlation
- [ ] User feedback integration
- [ ] Error-based feature flagging
- [ ] Automated bug report creation
- [ ] Customer support integration

---

_This error handling system provides production-ready error management with comprehensive logging,
user-friendly recovery options, and monitoring capabilities._
