import React, { useRef, useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  CalendarApi,
  EventApi,
  ViewApi,
} from '@fullcalendar/core';

import type {
  CalendarEvent,
  EventFormData,
  EventCategory,
} from '../types/event';
import { eventUtils } from '../types/event';
import { useUIStore } from '../stores/useUIStore';
import { useEventStore } from '../stores/useEventStore';
import { CalendarToolbar } from './Calendar/CalendarToolbar';
import { CustomEventContent } from './Calendar/CustomEventContent';
import { EventTooltip } from './Calendar/EventTooltip';
import { EventDialog } from './Calendar/EventDialog';
import { SearchResults } from './SearchResults';
import {
  RecurringEventDialog,
  type RecurringEventAction,
  type RecurringEventScope,
} from './Calendar/RecurringEventDialog';
import { DeleteEventDialog } from './Calendar/DeleteEventDialog';
import { BulkDeleteDialog } from './Calendar/BulkDeleteDialog';
import { QuickEditPopover } from './Calendar/QuickEditPopover';
import { useCalendarTheme } from './Calendar/hooks/useCalendarTheme';
import { useEventTooltip } from './Calendar/hooks/useEventTooltip';
import { useKeyboardShortcuts } from './Calendar/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsDialog } from './Calendar/KeyboardShortcutsDialog';
import { KeyboardShortcutsOverlay } from './Calendar/KeyboardShortcutsOverlay';
import { useKeyboardShortcutsOverlay } from './Calendar/hooks/useKeyboardShortcutsOverlay';
import { PrintDialog, type PrintOptions } from './Calendar/PrintDialog';
import { CalendarPrinter } from '../utils/printCalendar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { cn } from '../lib/utils';
import { TooltipProvider } from './ui/tooltip';
import { ToastContainer, useToast } from './ui/toast';
import '../styles/calendar-print.css';

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventClick?: (clickInfo: EventClickArg) => void;
  className?: string;
  showMiniCalendar?: boolean;
  enableAnimations?: boolean;
}

type CalendarView =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';

const Calendar: React.FC<CalendarProps> = ({
  events: propEvents,
  onDateSelect,
  onEventClick,
  className,
  enableAnimations = true,
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Store hooks
  const {
    calendarView,
    setCalendarView,
    isEventDialogOpen,
    setEventDialogOpen,
    selectedEventId,
    setSelectedEventId,
    selectedDateInfo,
    setSelectedDateInfo,
    isDarkMode,
  } = useUIStore();
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getAllEventsWithRecurring,
    updateRecurringEvent,
    deleteRecurringEvent,
    searchEventsAdvanced,
  } = useEventStore();

  // Custom hooks
  const { themeClasses } = useCalendarTheme(isDarkMode);
  const { isMobile } = useBreakpoint();
  const {
    tooltipState,
    hideTooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
  } = useEventTooltip(500);
  const { toasts, removeToast, success } = useToast();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CalendarEvent[]>([]);
  const [highlightedEventIds, setHighlightedEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Keyboard shortcuts dialog state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Print dialog state
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // Keyboard shortcuts overlay
  const {
    isVisible: isOverlayVisible,
    context: overlayContext,
    hideOverlay,
    trackNavigation,
    trackSearch,
    trackEventAction,
    trackViewChange,
  } = useKeyboardShortcutsOverlay({
    isEnabled: !isMobile, // Disable on mobile devices
  });

  // Events are now reactive through calendarEvents useMemo

  // Recurring event dialog state
  const [recurringEventDialog, setRecurringEventDialog] = useState<{
    isOpen: boolean;
    action: RecurringEventAction;
    eventId: string;
    eventTitle: string;
    isRecurringInstance: boolean;
    pendingData?: EventFormData;
  }>({
    isOpen: false,
    action: 'edit',
    eventId: '',
    eventTitle: '',
    isRecurringInstance: false,
  });

  // Delete confirmation dialog states
  const [deleteEventDialog, setDeleteEventDialog] = useState<{
    isOpen: boolean;
    eventToDelete: CalendarEvent | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    eventToDelete: null,
    isLoading: false,
  });

  const [bulkDeleteDialog, setBulkDeleteDialog] = useState<{
    isOpen: boolean;
    eventsToDelete: CalendarEvent[];
    isLoading: boolean;
  }>({
    isOpen: false,
    eventsToDelete: [],
    isLoading: false,
  });

  // Quick edit popover state
  const [quickEditPopover, setQuickEditPopover] = useState<{
    isVisible: boolean;
    event: CalendarEvent | null;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    event: null,
    position: { x: 0, y: 0 },
  });

  // Compute events array directly for better reactivity
  const calendarEvents = useMemo(() => {
    if (propEvents) {
      return propEvents.map(eventUtils.toFullCalendarEvent);
    }

    // Get events for a wide date range (6 months before and after current date)
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 6, 31);

    const allEvents = getAllEventsWithRecurring(
      startDate.toISOString(),
      endDate.toISOString(),
    );

    const fullCalendarEvents = allEvents.map((event) => {
      const fcEvent = eventUtils.toFullCalendarEvent(event);
      // Add search highlighting class if this event is in search results
      if (highlightedEventIds.has(event.id)) {
        fcEvent.classNames = [
          ...(fcEvent.classNames || []),
          'fc-event-search-highlighted',
        ];
      }
      return fcEvent;
    });

    return fullCalendarEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propEvents, events, getAllEventsWithRecurring, highlightedEventIds]);

  // Handle recurring event actions
  const handleRecurringEventAction = useCallback(
    (scope: RecurringEventScope) => {
      const { action, eventId, pendingData } = recurringEventDialog;

      if (action === 'edit' && pendingData) {
        updateRecurringEvent(eventId, pendingData, scope);
        success(
          'Recurring Event Updated',
          'The recurring event has been updated successfully',
        );
      } else if (action === 'delete') {
        deleteRecurringEvent(eventId, scope);
        success(
          'Recurring Event Deleted',
          'The recurring event has been deleted successfully',
        );
      }

      // Close dialogs and reset state
      setEventDialogOpen(false);
      setSelectedDateInfo(null);
      setSelectedEventId(null);
    },
    [
      recurringEventDialog,
      updateRecurringEvent,
      deleteRecurringEvent,
      setEventDialogOpen,
      setSelectedDateInfo,
      setSelectedEventId,
      success,
    ],
  );

  // Handle single event deletion with confirmation
  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      const event = getEventById(eventId);
      if (!event) return;

      if (event.recurrence) {
        // For recurring events, use the existing recurring event dialog
        setRecurringEventDialog({
          isOpen: true,
          action: 'delete',
          eventId: eventId,
          eventTitle: event.title,
          isRecurringInstance: !!event.recurrence.parentEventId,
        });
      } else {
        // For regular events, show delete confirmation dialog
        setDeleteEventDialog({
          isOpen: true,
          eventToDelete: event,
          isLoading: false,
        });
      }
    },
    [getEventById],
  );

  // Confirm single event deletion
  const confirmDeleteEvent = useCallback(async () => {
    const { eventToDelete } = deleteEventDialog;
    if (!eventToDelete) return;

    setDeleteEventDialog((prev) => ({ ...prev, isLoading: true }));

    try {
      deleteEvent(eventToDelete.id);

      // Close dialog and reset state
      setDeleteEventDialog({
        isOpen: false,
        eventToDelete: null,
        isLoading: false,
      });
    } catch {
      setDeleteEventDialog((prev) => ({ ...prev, isLoading: false }));
    }
  }, [deleteEventDialog, deleteEvent]);

  // Confirm bulk event deletion
  const confirmBulkDelete = useCallback(
    async (eventIds: string[]) => {
      setBulkDeleteDialog((prev) => ({ ...prev, isLoading: true }));

      try {
        // Delete each event
        eventIds.forEach((eventId) => {
          const event = getEventById(eventId);
          if (event?.recurrence) {
            // For recurring events, delete the entire series
            const parentId = event.recurrence.parentEventId || eventId;
            deleteEvent(parentId);
          } else {
            deleteEvent(eventId);
          }
        });

        // Close dialog and reset state
        setBulkDeleteDialog({
          isOpen: false,
          eventsToDelete: [],
          isLoading: false,
        });
      } catch {
        setBulkDeleteDialog((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [getEventById, deleteEvent],
  );

  // Handle quick edit popover
  const handleShowQuickEdit = useCallback(
    (event: CalendarEvent, position: { x: number; y: number }) => {
      setQuickEditPopover({
        isVisible: true,
        event,
        position,
      });
    },
    [],
  );

  const handleQuickEditSave = useCallback(
    (eventData: Partial<EventFormData>) => {
      const { event } = quickEditPopover;
      if (!event) return;

      if (event.recurrence) {
        // For recurring events, show the recurring event dialog
        setRecurringEventDialog({
          isOpen: true,
          action: 'edit',
          eventId: event.id,
          eventTitle: event.title,
          isRecurringInstance: !!event.recurrence.parentEventId,
          pendingData: eventData as EventFormData,
        });
      } else {
        // For regular events, update directly
        const updatedEvent: CalendarEvent = {
          ...event,
          ...eventData,
          updatedAt: new Date().toISOString(),
        };
        updateEvent(event.id, updatedEvent);
        success(
          'Event Updated',
          `"${eventData.title || event.title}" has been updated`,
        );
      }

      setQuickEditPopover({
        isVisible: false,
        event: null,
        position: { x: 0, y: 0 },
      });
    },
    [quickEditPopover, updateEvent, success],
  );

  const handleQuickEditOpenFull = useCallback(() => {
    const { event } = quickEditPopover;
    if (!event) return;

    setSelectedEventId(event.id);
    setEventDialogOpen(true);
    setQuickEditPopover({
      isVisible: false,
      event: null,
      position: { x: 0, y: 0 },
    });
  }, [quickEditPopover, setSelectedEventId, setEventDialogOpen]);

  // Handle search functionality
  const handleSearch = useCallback(
    (
      query: string,
      filters?: {
        categories?: EventCategory[];
        dateRange?: { start: string | null; end: string | null };
      },
    ) => {
      setSearchQuery(query);

      if (
        !query &&
        !filters?.categories?.length &&
        !filters?.dateRange?.start
      ) {
        setSearchResults([]);
        setHighlightedEventIds(new Set());
        setShowSearchResults(false);
        return;
      }

      const results = searchEventsAdvanced(query, filters);
      setSearchResults(results);
      setHighlightedEventIds(new Set(results.map((event) => event.id)));
      setShowSearchResults(results.length > 0);

      // Track search action for overlay
      trackSearch();
    },
    [searchEventsAdvanced, trackSearch],
  );

  // Handle search result click
  const handleSearchResultClick = useCallback(
    (event: CalendarEvent) => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        // Navigate to the event's date
        const eventDate = new Date(event.start);
        calendarApi.gotoDate(eventDate);

        // Highlight the event
        setHighlightedEventIds(new Set([event.id]));

        // Open event dialog after a short delay to ensure calendar renders
        setTimeout(() => {
          setSelectedEventId(event.id);
          setEventDialogOpen(true);
        }, 300);
      }

      setShowSearchResults(false);
    },
    [setSelectedEventId, setEventDialogOpen],
  );

  // Handle search focus
  const handleSearchFocus = useCallback(() => {
    // Focus the search input in the toolbar
    const searchInput = document.querySelector(
      '.search-bar input[type="text"]',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedEventIds(new Set());
    setShowSearchResults(false);
  }, []);

  // Handle create event via keyboard shortcut
  const handleCreateEvent = useCallback(() => {
    setSelectedEventId(null);
    setSelectedDateInfo(null);
    setEventDialogOpen(true);

    // Track event action for overlay
    trackEventAction();
  }, [
    setSelectedEventId,
    setSelectedDateInfo,
    setEventDialogOpen,
    trackEventAction,
  ]);

  // Handle refresh calendar
  const handleRefreshCalendar = useCallback(() => {
    // Force a re-render by clearing and resetting highlighted events
    setHighlightedEventIds(new Set());

    // Show a brief success message
    success(
      'Calendar Refreshed',
      'The calendar has been refreshed successfully',
    );
  }, [success]);

  // Handle toggle theme (if theme context is available)
  const handleToggleTheme = useCallback(() => {
    // This would typically toggle the theme through a theme context
    // For now, we'll just show a message that this feature is coming
    success('Theme Toggle', 'Theme switching coming soon!');
  }, [success]);

  // Get calendar API for programmatic control
  const getCalendarApi = useCallback(
    (): CalendarApi | null => calendarRef.current?.getApi() || null,
    [],
  );

  // Handle print dialog
  const handlePrint = useCallback(() => {
    setShowPrintDialog(true);
  }, []);

  const handlePrintCancel = useCallback(() => {
    setShowPrintDialog(false);
  }, []);

  const handlePrintExecute = useCallback(
    async (options: PrintOptions) => {
      const api = getCalendarApi();
      if (!api) {
        success('Print Error', 'Calendar not ready for printing');
        return;
      }

      try {
        const currentView = api.view.type;
        const title = api.view.title;

        // Create date range based on current view
        const dateRange = {
          start: new Date(api.view.currentStart),
          end: new Date(api.view.currentEnd),
          title: title,
        };

        if (
          'preview' in options &&
          (options as PrintOptions & { preview?: boolean }).preview
        ) {
          await CalendarPrinter.previewCalendar({
            calendarApi: api,
            options,
            dateRange,
            currentView,
          });
          success('Print Preview', 'Print preview opened in new window');
        } else {
          await CalendarPrinter.printCalendar({
            calendarApi: api,
            options,
            dateRange,
            currentView,
          });
          success('Print Started', 'Calendar sent to printer');
        }
      } catch (error) {
        // Log error details for debugging but don't expose to console in production
        success(
          'Print Error',
          `Failed to print calendar: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [getCalendarApi, success],
  );

  // Save view preference to localStorage when changed
  const handleViewChange = useCallback(
    (view: CalendarView) => {
      setCalendarView(view);
      localStorage.setItem('calendar-view', view);

      // Track view change for overlay
      trackViewChange();
    },
    [setCalendarView, trackViewChange],
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    calendarApi: getCalendarApi,
    onViewChange: (view: string) => handleViewChange(view as CalendarView),
    currentView: calendarView,
    isEnabled: true,
    onDeleteEvent: handleDeleteEvent,
    selectedEventId,
    onFocusSearch: handleSearchFocus,
    onClearSearch: handleSearchClear,
    onShowHelp: () => setShowKeyboardShortcuts(true),
    onCreateEvent: handleCreateEvent,
    onToggleTheme: handleToggleTheme,
    onRefresh: handleRefreshCalendar,
    onTrackNavigation: trackNavigation,
  });

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      if (onDateSelect) {
        onDateSelect(selectInfo);
        return;
      }

      // Default behavior: open modern event dialog
      setSelectedEventId(null);
      setSelectedDateInfo(selectInfo);
      setEventDialogOpen(true);
      selectInfo.view.calendar.unselect();
    },
    [onDateSelect, setSelectedEventId, setSelectedDateInfo, setEventDialogOpen],
  );

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      if (onEventClick) {
        onEventClick(clickInfo);
        return;
      }

      const eventId = clickInfo.event.id;
      if (!eventId) return;

      const event = getEventById(eventId);
      if (!event) return;

      // Check if it's a right-click or ctrl+click for quick edit
      const isQuickEdit =
        clickInfo.jsEvent.button === 2 ||
        clickInfo.jsEvent.ctrlKey ||
        clickInfo.jsEvent.metaKey;

      if (isQuickEdit && !isMobile) {
        // Show quick edit popover
        const rect = clickInfo.el.getBoundingClientRect();
        handleShowQuickEdit(event, {
          x: rect.right + 10,
          y: rect.top,
        });
      } else {
        // Default behavior: open full event dialog for editing
        setSelectedEventId(eventId);
        setEventDialogOpen(true);
      }
    },
    [
      onEventClick,
      getEventById,
      isMobile,
      handleShowQuickEdit,
      setSelectedEventId,
      setEventDialogOpen,
    ],
  );

  // Custom event content renderer
  const renderEventContent = useCallback(
    (eventInfo: EventContentArg) => (
      <CustomEventContent eventInfo={eventInfo} />
    ),
    [],
  );

  // Event handlers for tooltips
  const handleEventDidMount = useCallback(
    (eventInfo: { event: EventApi; el: HTMLElement }) => {
      if (isMobile) return; // Skip tooltips on mobile

      // Convert EventApi to EventInput format for eventUtils
      const eventInput = {
        id: eventInfo.event.id || '',
        title: eventInfo.event.title || '',
        start: eventInfo.event.start || new Date(),
        end: eventInfo.event.end || new Date(),
        allDay: eventInfo.event.allDay,
        extendedProps: eventInfo.event.extendedProps,
      };
      const eventData = eventUtils.fromFullCalendarEvent(eventInput);
      const element = eventInfo.el as HTMLElement & {
        _tooltipCleanup?: () => void;
      };

      // Add event listeners for tooltip
      const handleMouseEnter = (e: MouseEvent) => {
        handleEventMouseEnter(eventData, e);
      };

      const handleMouseLeave = () => {
        handleEventMouseLeave();
      };

      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);

      // Store cleanup function
      element._tooltipCleanup = () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    },
    [isMobile, handleEventMouseEnter, handleEventMouseLeave],
  );

  const handleEventWillUnmount = useCallback(
    (eventInfo: { el: HTMLElement & { _tooltipCleanup?: () => void } }) => {
      eventInfo.el._tooltipCleanup?.();
    },
    [],
  );

  // Responsive calendar configuration
  const calendarConfig = useMemo(
    () => ({
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      headerToolbar: false as const, // We'll use custom toolbar
      initialView: calendarView,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: isMobile ? 2 : 4,
      weekends: true,
      events: calendarEvents,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventContent: renderEventContent,
      eventDidMount: handleEventDidMount,
      eventWillUnmount: handleEventWillUnmount,
      eventMouseEnter: (info: {
        event: EventApi;
        el: HTMLElement;
        jsEvent: MouseEvent;
        view: unknown;
      }) => {
        // Disable context menu on events to allow right-click for quick edit
        info.el.addEventListener('contextmenu', (e: Event) => {
          e.preventDefault();
          // Create proper EventClickArg structure
          const clickInfo = {
            event: info.event,
            el: info.el,
            jsEvent: e as MouseEvent,
            view: info.view as ViewApi,
          } as EventClickArg;
          handleEventClick(clickInfo);
        });
      },
      height: isMobile ? 'auto' : 650,
      aspectRatio: isMobile ? 1.0 : 1.35,
      expandRows: !isMobile,
      handleWindowResize: true,

      // Enhanced view configurations
      views: {
        dayGridMonth: {
          dayMaxEvents: isMobile ? 2 : 4,
          moreLinkText: 'more',
          fixedWeekCount: false,
        },
        timeGridWeek: {
          slotMinTime: '06:00:00',
          slotMaxTime: '22:00:00',
          allDaySlot: true,
          slotDuration: '00:30:00',
          expandRows: true,
        },
        timeGridDay: {
          slotMinTime: '06:00:00',
          slotMaxTime: '22:00:00',
          allDaySlot: true,
          slotDuration: '00:15:00',
        },
        listWeek: {
          listDayFormat: {
            weekday: isMobile ? ('short' as const) : ('long' as const),
            month: 'short' as const,
            day: 'numeric' as const,
          },
          noEventsText: '📅 No events to display',
        },
      },

      // Event display enhancements
      eventDisplay: 'auto',
      eventTimeFormat: {
        hour: 'numeric' as const,
        minute: '2-digit' as const,
        omitZeroMinute: false,
        meridiem: 'short' as const,
      },

      // Accessibility
      locale: 'en',
      timeZone: 'local',

      // Animation and interaction
      eventStartEditable: true,
      eventDurationEditable: true,
      eventResizableFromStart: true,

      // View change callback to sync state
      viewDidMount: (info: { view: { type: string } }) => {
        const newView = info.view.type as CalendarView;
        if (newView !== calendarView) {
          setCalendarView(newView);
          localStorage.setItem('calendar-view', newView);
        }
      },
    }),
    [
      calendarView,
      isMobile,
      calendarEvents,
      handleDateSelect,
      handleEventClick,
      renderEventContent,
      handleEventDidMount,
      handleEventWillUnmount,
      setCalendarView,
    ],
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          'calendar-container bg-white dark:bg-gray-900',
          'rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
          'transition-colors duration-200',
          themeClasses.calendar,
          className,
        )}
        role="application"
        aria-label="Interactive calendar"
        aria-describedby="calendar-help"
      >
        {/* Screen reader help text */}
        <div id="calendar-help" className="sr-only">
          Use arrow keys, H/L, or J/K to navigate between periods. Press T for
          today. Use N or C to create new events. Use Alt+1-4 to switch views:
          Alt+1 for month, Alt+2 for week, Alt+3 for day, Alt+4 for list. Press
          ? to show all keyboard shortcuts. Press Escape to close dialogs. Use
          Ctrl+F to search events.
        </div>

        {/* Enhanced Custom Toolbar */}
        <CalendarToolbar
          calendarApi={getCalendarApi}
          currentView={calendarView}
          onViewChange={handleViewChange}
          isMobile={isMobile}
          enableAnimations={enableAnimations}
          onSearch={handleSearch}
          onPrint={handlePrint}
        />

        {/* FullCalendar Component with Enhanced Styling */}
        <div
          className={cn(
            'calendar-wrapper p-4 relative',
            '[&_.fc]:font-sans',
            '[&_.fc-toolbar]:hidden', // Hide default toolbar since we use custom
            '[&_.fc-view-harness]:rounded-lg',
            enableAnimations &&
              '[&_.fc-event]:transition-all [&_.fc-event]:duration-200',
            // Search highlighting styles
            '[&_.fc-event-search-highlighted]:ring-2 [&_.fc-event-search-highlighted]:ring-blue-500',
            '[&_.fc-event-search-highlighted]:ring-opacity-75 [&_.fc-event-search-highlighted]:animate-pulse',
            '[&_.fc-event-search-highlighted]:shadow-lg [&_.fc-event-search-highlighted]:z-10',
            themeClasses.content,
          )}
        >
          <FullCalendar ref={calendarRef} {...calendarConfig} />

          {/* Search Results Overlay */}
          {showSearchResults && (
            <div className="absolute top-4 right-4 w-80 z-50">
              <SearchResults
                results={searchResults}
                query={searchQuery}
                onEventClick={handleSearchResultClick}
                className="shadow-xl"
                maxHeight="400px"
              />
            </div>
          )}
        </div>

        {/* Event Tooltip */}
        {tooltipState.event && !isEventDialogOpen && (
          <EventTooltip
            event={tooltipState.event}
            position={tooltipState.position}
            isVisible={tooltipState.isVisible}
            onClose={hideTooltip}
          />
        )}

        {/* Event Dialog */}
        <EventDialog
          isOpen={isEventDialogOpen}
          onClose={() => {
            setEventDialogOpen(false);
            setSelectedDateInfo(null);
            setSelectedEventId(null);
          }}
          onSave={(eventData: EventFormData) => {
            if (selectedEventId) {
              // Update existing event
              const existingEvent = getEventById(selectedEventId);
              if (existingEvent && existingEvent.recurrence) {
                // This is a recurring event, show the recurring event dialog
                setRecurringEventDialog({
                  isOpen: true,
                  action: 'edit',
                  eventId: selectedEventId,
                  eventTitle: existingEvent.title,
                  isRecurringInstance: !!existingEvent.recurrence.parentEventId,
                  pendingData: eventData,
                });
                return;
              } else if (existingEvent) {
                // Regular event update
                const updatedEvent: CalendarEvent = {
                  ...existingEvent,
                  ...eventData,
                  id: selectedEventId,
                  createdAt: existingEvent.createdAt,
                  updatedAt: new Date().toISOString(),
                };
                updateEvent(selectedEventId, updatedEvent);
                success(
                  'Event Updated',
                  `"${eventData.title}" has been updated successfully`,
                );
              }
            } else {
              // Create new event
              const newEvent = {
                ...eventData,
                id: eventUtils.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              addEvent(newEvent);
              success(
                'Event Created',
                `"${eventData.title}" has been added to your calendar`,
              );
            }

            // Close dialog and reset state
            setEventDialogOpen(false);
            setSelectedDateInfo(null);
            setSelectedEventId(null);
          }}
          onDelete={
            selectedEventId
              ? () => handleDeleteEvent(selectedEventId)
              : undefined
          }
          initialData={
            selectedEventId
              ? (() => {
                  const event = getEventById(selectedEventId);
                  if (event) {
                    return {
                      title: event.title,
                      start:
                        typeof event.start === 'string'
                          ? event.start
                          : event.start.toISOString().slice(0, 16),
                      end: event.end
                        ? typeof event.end === 'string'
                          ? event.end
                          : event.end.toISOString().slice(0, 16)
                        : undefined,
                      allDay: event.allDay,
                      category: event.category,
                      priority: event.priority,
                      status: event.status,
                      description: event.description,
                      location: event.location,
                      attendees: event.attendees,
                      url: event.url,
                      recurrence: event.recurrence,
                    };
                  }
                  return undefined;
                })()
              : undefined
          }
          selectedDateInfo={selectedDateInfo}
        />

        {/* Recurring Event Dialog */}
        <RecurringEventDialog
          isOpen={recurringEventDialog.isOpen}
          onClose={() =>
            setRecurringEventDialog((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={handleRecurringEventAction}
          action={recurringEventDialog.action}
          eventTitle={recurringEventDialog.eventTitle}
          isRecurringInstance={recurringEventDialog.isRecurringInstance}
        />

        {/* Delete Event Confirmation Dialog */}
        <DeleteEventDialog
          isOpen={deleteEventDialog.isOpen}
          onClose={() =>
            setDeleteEventDialog({
              isOpen: false,
              eventToDelete: null,
              isLoading: false,
            })
          }
          onConfirm={confirmDeleteEvent}
          event={deleteEventDialog.eventToDelete}
          isLoading={deleteEventDialog.isLoading}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          isOpen={bulkDeleteDialog.isOpen}
          onClose={() =>
            setBulkDeleteDialog({
              isOpen: false,
              eventsToDelete: [],
              isLoading: false,
            })
          }
          onConfirm={confirmBulkDelete}
          events={bulkDeleteDialog.eventsToDelete}
          isLoading={bulkDeleteDialog.isLoading}
        />

        {/* Quick Edit Popover */}
        {quickEditPopover.event && (
          <QuickEditPopover
            event={quickEditPopover.event}
            isVisible={quickEditPopover.isVisible}
            position={quickEditPopover.position}
            onClose={() =>
              setQuickEditPopover({
                isVisible: false,
                event: null,
                position: { x: 0, y: 0 },
              })
            }
            onSave={handleQuickEditSave}
            onDelete={() => {
              if (quickEditPopover.event) {
                handleDeleteEvent(quickEditPopover.event.id);
                setQuickEditPopover({
                  isVisible: false,
                  event: null,
                  position: { x: 0, y: 0 },
                });
              }
            }}
            onOpenFullEdit={handleQuickEditOpenFull}
          />
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />

        {/* Print Dialog */}
        <PrintDialog
          isOpen={showPrintDialog}
          onClose={handlePrintCancel}
          onPrint={handlePrintExecute}
          currentView={calendarView}
          dateRange={{
            start: new Date(getCalendarApi()?.view.currentStart || new Date()),
            end: new Date(getCalendarApi()?.view.currentEnd || new Date()),
            title: getCalendarApi()?.view.title || 'Calendar',
          }}
        />

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardShortcutsOverlay
          isVisible={isOverlayVisible}
          context={overlayContext}
          onDismiss={hideOverlay}
        />
      </div>
    </TooltipProvider>
  );
};

export default Calendar;
