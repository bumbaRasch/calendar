import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  FocusManager,
  ScreenReaderAnnouncer,
  prefersReducedMotion,
  isHighContrastMode,
  KEYBOARD_KEYS,
  initializeAccessibility,
} from '../lib/accessibility';

// Hook for managing focus trap in modals/dialogs
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      // Clean up existing focus trap
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    // Save current focus
    FocusManager.saveFocus();

    // Set up focus trap
    const cleanup = FocusManager.trapFocus(containerRef.current);
    cleanupRef.current = cleanup;

    // Focus first focusable element
    const focusableElements = FocusManager.getFocusableElements(
      containerRef.current,
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Cleanup on unmount or when isActive becomes false
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Restore focus when trap is removed
      if (isActive) {
        FocusManager.restoreFocus();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Hook for keyboard event handling with accessibility considerations
export const useKeyboardNavigation = (
  onKeyDown?: (event: KeyboardEvent) => void,
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      onKeyDown?.(event);
    },
    [onKeyDown],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      ScreenReaderAnnouncer.announce(message, priority);
    },
    [],
  );

  const announceNavigation = useCallback(
    (message: string) => {
      announce(`Navigated to ${message}`, 'polite');
    },
    [announce],
  );

  const announceAction = useCallback(
    (message: string) => {
      announce(`Action: ${message}`, 'assertive');
    },
    [announce],
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce],
  );

  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Success: ${message}`, 'polite');
    },
    [announce],
  );

  return {
    announce,
    announceNavigation,
    announceAction,
    announceError,
    announceSuccess,
  };
};

// Hook for managing roving tabindex
export const useRovingTabIndex = (
  containerSelector: string,
  itemSelector: string,
  enabled: boolean = true,
) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    // Clean up previous instance
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Set up new roving tabindex
    const items = Array.from(
      container.querySelectorAll(itemSelector),
    ) as HTMLElement[];
    let currentIndex = 0;

    // Set initial tabindex
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      let newIndex = currentIndex;

      switch (key) {
        case KEYBOARD_KEYS.ARROW_RIGHT:
        case KEYBOARD_KEYS.ARROW_DOWN:
          event.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
          break;

        case KEYBOARD_KEYS.ARROW_LEFT:
        case KEYBOARD_KEYS.ARROW_UP:
          event.preventDefault();
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          break;

        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          newIndex = 0;
          break;

        case KEYBOARD_KEYS.END:
          event.preventDefault();
          newIndex = items.length - 1;
          break;

        default:
          return;
      }

      // Update tabindex
      items[currentIndex].tabIndex = -1;
      items[newIndex].tabIndex = 0;
      items[newIndex].focus();
      currentIndex = newIndex;
    };

    const handleFocus = (event: FocusEvent) => {
      const index = items.indexOf(event.target as HTMLElement);
      if (index !== -1) {
        currentIndex = index;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focus', handleFocus, true);

    cleanupRef.current = () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus, true);
    };

    return cleanupRef.current;
  }, [containerSelector, itemSelector, enabled]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};

// Hook for detecting user preferences
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: prefersReducedMotion(),
        prefersHighContrast: isHighContrastMode(),
      });
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(-ms-high-contrast: active)'),
    ];

    mediaQueries.forEach((mq) => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
};

// Hook for managing ARIA attributes
export const useAriaAttributes = (
  elementRef: React.RefObject<HTMLElement>,
  attributes: Record<string, string | boolean | undefined>,
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    });
  }, [elementRef, attributes]);
};

// Hook for skip links functionality
export const useSkipLinks = () => {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    skipToContent('navigation');
  }, [skipToContent]);

  const skipToMain = useCallback(() => {
    skipToContent('main-content');
  }, [skipToContent]);

  return {
    skipToContent,
    skipToNavigation,
    skipToMain,
  };
};

// Hook for form accessibility
export const useFormAccessibility = (fieldName: string) => {
  const [error, setError] = useState<string>('');
  const [hasDescription, setHasDescription] = useState(false);

  const fieldId = `field-${fieldName}`;
  const errorId = `${fieldName}-error`;
  const descriptionId = `${fieldName}-description`;

  const ariaDescribedBy = useMemo(() => {
    const ids: string[] = [];
    if (hasDescription) ids.push(descriptionId);
    if (error) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [hasDescription, error, descriptionId, errorId]);

  const fieldProps = {
    id: fieldId,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': error ? ('true' as const) : undefined,
  };

  const errorProps = {
    id: errorId,
    role: 'alert' as const,
    'aria-live': 'polite' as const,
  };

  const descriptionProps = {
    id: descriptionId,
  };

  return {
    fieldProps,
    errorProps,
    descriptionProps,
    error,
    setError,
    setHasDescription,
  };
};

// Hook for initializing accessibility features
export const useAccessibilitySetup = () => {
  useEffect(() => {
    initializeAccessibility();
  }, []);
};
