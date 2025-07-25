import { useState, useEffect, useCallback, useRef } from 'react';

interface UseKeyboardShortcutsOverlayProps {
  isEnabled?: boolean;
  showDelay?: number;
  dismissAfter?: number;
}

interface OverlayState {
  isVisible: boolean;
  context: 'calendar' | 'search' | 'event' | 'navigation';
}

const STORAGE_KEY = 'keyboard-shortcuts-overlay-dismissed';
const SHOW_OVERLAY_AFTER_ACTIONS = 3; // Show overlay after 3 user actions
const MIN_TIME_BETWEEN_OVERLAYS = 5 * 60 * 1000; // 5 minutes

export const useKeyboardShortcutsOverlay = ({
  isEnabled = true,
  showDelay = 2000,
  dismissAfter = 8000,
}: UseKeyboardShortcutsOverlayProps = {}) => {
  const [overlayState, setOverlayState] = useState<OverlayState>({
    isVisible: false,
    context: 'calendar',
  });

  const actionCountRef = useRef(0);
  const lastShownTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if overlays have been permanently dismissed
  const isOverlayDismissed = useCallback(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      return dismissed === 'true';
    } catch {
      return false;
    }
  }, []);

  // Mark overlay as permanently dismissed
  const dismissOverlayPermanently = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Silently ignore localStorage errors
    }
  }, []);

  // Check if enough time has passed since last overlay
  const canShowOverlay = useCallback(() => {
    const now = Date.now();
    return (
      isEnabled &&
      !isOverlayDismissed() &&
      now - lastShownTimeRef.current > MIN_TIME_BETWEEN_OVERLAYS
    );
  }, [isEnabled, isOverlayDismissed]);

  // Show overlay with context
  const showOverlay = useCallback(
    (context: OverlayState['context']) => {
      if (!canShowOverlay()) return;

      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }

      // Show overlay after delay
      timeoutRef.current = setTimeout(() => {
        setOverlayState({
          isVisible: true,
          context,
        });
        lastShownTimeRef.current = Date.now();

        // Auto-dismiss after specified time
        dismissTimeoutRef.current = setTimeout(() => {
          setOverlayState((prev) => ({
            ...prev,
            isVisible: false,
          }));
        }, dismissAfter);
      }, showDelay);
    },
    [canShowOverlay, showDelay, dismissAfter],
  );

  // Hide overlay
  const hideOverlay = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    setOverlayState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  // Track user actions and show overlay when appropriate
  const trackAction = useCallback(
    (actionType: 'navigation' | 'search' | 'event' | 'view-change') => {
      actionCountRef.current += 1;

      // Show overlay after certain number of actions
      if (actionCountRef.current >= SHOW_OVERLAY_AFTER_ACTIONS) {
        actionCountRef.current = 0; // Reset counter

        // Determine context based on action type
        let context: OverlayState['context'] = 'calendar';
        switch (actionType) {
          case 'navigation':
            context = 'navigation';
            break;
          case 'search':
            context = 'search';
            break;
          case 'event':
            context = 'event';
            break;
          case 'view-change':
            context = 'calendar';
            break;
        }

        showOverlay(context);
      }
    },
    [showOverlay],
  );

  // Track specific user interactions
  const trackNavigation = useCallback(
    () => trackAction('navigation'),
    [trackAction],
  );
  const trackSearch = useCallback(() => trackAction('search'), [trackAction]);
  const trackEventAction = useCallback(
    () => trackAction('event'),
    [trackAction],
  );
  const trackViewChange = useCallback(
    () => trackAction('view-change'),
    [trackAction],
  );

  // Show overlay manually for specific contexts
  const showNavigationOverlay = useCallback(
    () => showOverlay('navigation'),
    [showOverlay],
  );
  const showSearchOverlay = useCallback(
    () => showOverlay('search'),
    [showOverlay],
  );
  const showEventOverlay = useCallback(
    () => showOverlay('event'),
    [showOverlay],
  );

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  // Listen for mouse inactivity to show helpful overlays
  useEffect(() => {
    if (!isEnabled) return;

    let inactivityTimer: NodeJS.Timeout | null = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Show overlay after 30 seconds of inactivity
      inactivityTimer = setTimeout(() => {
        if (canShowOverlay()) {
          showOverlay('calendar');
        }
      }, 30000);
    };

    const handleMouseMove = () => {
      resetInactivityTimer();
    };

    document.addEventListener('mousemove', handleMouseMove);
    resetInactivityTimer();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [isEnabled, canShowOverlay, showOverlay]);

  return {
    // State
    isVisible: overlayState.isVisible,
    context: overlayState.context,

    // Actions
    hideOverlay,
    dismissPermanently: dismissOverlayPermanently,

    // Tracking functions
    trackNavigation,
    trackSearch,
    trackEventAction,
    trackViewChange,

    // Manual overlay triggers
    showNavigationOverlay,
    showSearchOverlay,
    showEventOverlay,
  };
};
