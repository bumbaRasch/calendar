import { useState, useCallback, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../../../types/event';

interface TooltipState {
  event: CalendarEvent | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

interface UseEventTooltipReturn {
  tooltipState: TooltipState;
  showTooltip: (
    event: CalendarEvent,
    position: { x: number; y: number },
  ) => void;
  hideTooltip: () => void;
  handleEventMouseEnter: (event: CalendarEvent, mouseEvent: MouseEvent) => void;
  handleEventMouseLeave: () => void;
}

export const useEventTooltip = (delay: number = 500): UseEventTooltipReturn => {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    event: null,
    position: { x: 0, y: 0 },
    isVisible: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = useCallback(
    (event: CalendarEvent, position: { x: number; y: number }) => {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setTooltipState({
          event,
          position,
          isVisible: true,
        });
      }, delay);
    },
    [delay],
  );

  const hideTooltip = useCallback(() => {
    // Clear show timeout if it's pending
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Hide after a short delay to allow for mouse movement
    hideTimeoutRef.current = setTimeout(() => {
      setTooltipState((prev) => ({
        ...prev,
        isVisible: false,
      }));
    }, 100);
  }, []);

  const handleEventMouseEnter = useCallback(
    (event: CalendarEvent, mouseEvent: MouseEvent) => {
      const rect = (mouseEvent.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      };

      showTooltip(event, position);
    },
    [showTooltip],
  );

  const handleEventMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && tooltipState.isVisible) {
        setTooltipState((prev) => ({ ...prev, isVisible: false }));
      }
    };

    if (tooltipState.isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [tooltipState.isVisible]);

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipState.isVisible) {
        // Check if click is on tooltip content
        const target = event.target as Element;
        if (!target.closest('[data-tooltip-content]')) {
          setTooltipState((prev) => ({ ...prev, isVisible: false }));
        }
      }
    };

    if (tooltipState.isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tooltipState.isVisible]);

  return {
    tooltipState,
    showTooltip,
    hideTooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
  };
};
