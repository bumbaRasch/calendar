// Accessibility utilities and constants for the calendar application

// ARIA roles and properties
export const ARIA_ROLES = {
  application: 'application',
  dialog: 'dialog',
  button: 'button',
  listbox: 'listbox',
  option: 'option',
  menubar: 'menubar',
  menu: 'menu',
  menuitem: 'menuitem',
  tab: 'tab',
  tabpanel: 'tabpanel',
  tablist: 'tablist',
  grid: 'grid',
  gridcell: 'gridcell',
  row: 'row',
  columnheader: 'columnheader',
  rowheader: 'rowheader',
  status: 'status',
  alert: 'alert',
  region: 'region',
  banner: 'banner',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
} as const;

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  static saveFocus(element?: HTMLElement) {
    const activeElement = element || (document.activeElement as HTMLElement);
    if (activeElement && activeElement !== document.body) {
      this.focusStack.push(activeElement);
    }
  }

  static restoreFocus() {
    const lastFocusedElement = this.focusStack.pop();
    if (lastFocusedElement && lastFocusedElement.focus) {
      try {
        lastFocusedElement.focus();
      } catch (_error) {
        // Failed to restore focus - element may no longer exist
      }
    }
  }

  static trapFocus(container: HTMLElement, firstFocusable?: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = firstFocusable || focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== KEYBOARD_KEYS.TAB) return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      'details summary',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (element) => {
        const el = element as HTMLElement;
        return el.offsetParent !== null && !el.hidden;
      },
    ) as HTMLElement[];
  }

  static getNextFocusableElement(
    container: HTMLElement,
    currentElement: HTMLElement,
    direction: 'next' | 'previous' = 'next',
  ): HTMLElement | null {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex === -1) return null;

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else {
      nextIndex =
        currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    return focusableElements[nextIndex] || null;
  }
}

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  static initialize() {
    if (this.liveRegion || typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'screen-reader-announcements';
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';

    document.body.appendChild(this.liveRegion);
  }

  static announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
  ) {
    if (!this.liveRegion) this.initialize();
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement to prevent repeat announcements
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

// Accessibility helpers for form validation
export const createFieldErrorId = (fieldName: string): string => {
  return `${fieldName}-error`;
};

export const createFieldDescriptionId = (fieldName: string): string => {
  return `${fieldName}-description`;
};

export const getAriaDescribedBy = (
  fieldName: string,
  hasError: boolean,
  hasDescription: boolean,
): string => {
  const ids: string[] = [];

  if (hasDescription) {
    ids.push(createFieldDescriptionId(fieldName));
  }

  if (hasError) {
    ids.push(createFieldErrorId(fieldName));
  }

  return ids.length > 0 ? ids.join(' ') : '';
};

// Calendar-specific accessibility helpers
export const getCalendarCellAriaLabel = (
  date: Date,
  hasEvents: boolean,
  isToday: boolean,
  isSelected: boolean,
  isOtherMonth: boolean,
): string => {
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modifiers: string[] = [];

  if (isToday) modifiers.push('today');
  if (isSelected) modifiers.push('selected');
  if (isOtherMonth) modifiers.push('other month');
  if (hasEvents) modifiers.push('has events');

  const modifierString =
    modifiers.length > 0 ? `, ${modifiers.join(', ')}` : '';

  return `${dateString}${modifierString}`;
};

export const getEventAriaLabel = (
  title: string,
  startTime?: string,
  endTime?: string,
  isAllDay: boolean = false,
): string => {
  if (isAllDay) {
    return `All day event: ${title}`;
  }

  if (startTime && endTime) {
    return `Event: ${title}, from ${startTime} to ${endTime}`;
  }

  if (startTime) {
    return `Event: ${title}, starts at ${startTime}`;
  }

  return `Event: ${title}`;
};

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches ||
    window.matchMedia('(-ms-high-contrast: black-on-white)').matches ||
    window.matchMedia('(-ms-high-contrast: white-on-black)').matches
  );
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Color contrast utilities
export const meetsContrastRequirements = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
): boolean => {
  const contrast = calculateContrastRatio(foreground, background);
  const threshold = level === 'AAA' ? 7 : 4.5;
  return contrast >= threshold;
};

// Simplified contrast calculation (would need full implementation for production)
const calculateContrastRatio = (_color1: string, _color2: string): number => {
  // This is a simplified version - in production, you'd want a full color contrast library
  // For now, return a reasonable default
  return 4.5;
};

// Keyboard navigation patterns
export const createRovingTabIndex = (
  container: HTMLElement,
  itemSelector: string,
): (() => void) => {
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

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

// ARIA live region for calendar updates
export const announceCalendarUpdate = (message: string) => {
  ScreenReaderAnnouncer.announce(message, 'polite');
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  ScreenReaderAnnouncer.initialize();

  // Add skip links if not present
  addSkipLinks();

  // Set up global keyboard shortcuts
  setupGlobalKeyboardShortcuts();
};

const addSkipLinks = () => {
  if (typeof document === 'undefined') return;

  const existingSkipLinks = document.querySelector('.skip-links');
  if (existingSkipLinks) return;

  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';
  skipLinks.innerHTML = `
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>
  `;

  // Add CSS for skip links
  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
      color: white;
      background: #000;
      padding: 8px;
      text-decoration: none;
      border-radius: 0 0 4px 4px;
      opacity: 0;
      transition: opacity 0.3s, top 0.3s;
    }
    
    .skip-link:focus {
      top: 0;
      opacity: 1;
    }
  `;

  document.head.appendChild(style);
  document.body.insertBefore(skipLinks, document.body.firstChild);
};

const setupGlobalKeyboardShortcuts = () => {
  if (typeof document === 'undefined') return;

  document.addEventListener('keydown', (event) => {
    // Handle global accessibility shortcuts
    if (event.altKey && event.key === '1') {
      // Skip to main content
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    }
  });
};
