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
} from '@fullcalendar/core';

import type { CalendarEvent, EventFormData } from '../types/event';
import { eventUtils } from '../types/event';
import { useUIStore } from '../stores/useUIStore';
import { useEventStore } from '../stores/useEventStore';
import { CalendarToolbar } from './Calendar/CalendarToolbar';
import { CustomEventContent } from './Calendar/CustomEventContent';
import { EventTooltip } from './Calendar/EventTooltip';
import { EventDialog } from './Calendar/EventDialog';
import {
  RecurringEventDialog,
  type RecurringEventAction,
  type RecurringEventScope,
} from './Calendar/RecurringEventDialog';
import { useCalendarTheme } from './Calendar/hooks/useCalendarTheme';
import { useEventTooltip } from './Calendar/hooks/useEventTooltip';
import { useKeyboardShortcuts } from './Calendar/hooks/useKeyboardShortcuts';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { cn } from '../lib/utils';
import { TooltipProvider } from './ui/tooltip';

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
    addEvent,
    updateEvent,
    getEventById,
    getAllEventsWithRecurring,
    updateRecurringEvent,
    deleteRecurringEvent,
  } = useEventStore();

  // Custom hooks
  const { theme, themeClasses } = useCalendarTheme(isDarkMode);
  const { isMobile } = useBreakpoint();
  const {
    tooltipState,
    hideTooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
  } = useEventTooltip(500);

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

  // Create event fetcher function for FullCalendar
  const getEventsForRange = useCallback(
    (fetchInfo: { start: Date; end: Date }) => {
      if (propEvents) {
        // If prop events are provided, use them directly
        return propEvents.map(eventUtils.toFullCalendarEvent);
      }

      // Otherwise, get events from store including recurring instances
      const allEvents = getAllEventsWithRecurring(
        fetchInfo.start.toISOString(),
        fetchInfo.end.toISOString(),
      );

      return allEvents.map(eventUtils.toFullCalendarEvent);
    },
    [propEvents, getAllEventsWithRecurring],
  );

  // Handle recurring event actions
  const handleRecurringEventAction = useCallback(
    (scope: RecurringEventScope) => {
      const { action, eventId, pendingData } = recurringEventDialog;

      if (action === 'edit' && pendingData) {
        updateRecurringEvent(eventId, pendingData, scope);
      } else if (action === 'delete') {
        deleteRecurringEvent(eventId, scope);
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
    ],
  );

  // Get calendar API for programmatic control
  const getCalendarApi = useCallback(
    (): CalendarApi | null => calendarRef.current?.getApi() || null,
    [],
  );

  // Save view preference to localStorage when changed
  const handleViewChange = useCallback(
    (view: CalendarView) => {
      setCalendarView(view);
      localStorage.setItem('calendar-view', view);
    },
    [setCalendarView],
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    calendarApi: getCalendarApi,
    onViewChange: (view: string) => handleViewChange(view as CalendarView),
    currentView: calendarView,
    isEnabled: true,
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

      // Default behavior: open event dialog for editing
      const eventId = clickInfo.event.id;
      if (eventId) {
        setSelectedEventId(eventId);
        setEventDialogOpen(true);
      }
    },
    [onEventClick, setSelectedEventId, setEventDialogOpen],
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
      events: getEventsForRange,
      select: handleDateSelect,
      eventClick: handleEventClick,
      eventContent: renderEventContent,
      eventDidMount: handleEventDidMount,
      eventWillUnmount: handleEventWillUnmount,
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
      getEventsForRange,
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
          Use arrow keys or H/L to navigate between periods. Press T for today.
          Use Alt+1-4 to switch views: Alt+1 for month, Alt+2 for week, Alt+3
          for day, Alt+4 for list. Press Escape to close dialogs.
        </div>

        {/* Enhanced Custom Toolbar */}
        <CalendarToolbar
          calendarApi={getCalendarApi}
          currentView={calendarView}
          onViewChange={handleViewChange}
          theme={theme as 'light' | 'dark'}
          isMobile={isMobile}
          enableAnimations={enableAnimations}
        />

        {/* FullCalendar Component with Enhanced Styling */}
        <div
          className={cn(
            'calendar-wrapper p-4',
            '[&_.fc]:font-sans',
            '[&_.fc-toolbar]:hidden', // Hide default toolbar since we use custom
            '[&_.fc-view-harness]:rounded-lg',
            enableAnimations &&
              '[&_.fc-event]:transition-all [&_.fc-event]:duration-200',
            themeClasses.content,
          )}
        >
          <FullCalendar ref={calendarRef} {...calendarConfig} />
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
            }

            // Close dialog and reset state
            setEventDialogOpen(false);
            setSelectedDateInfo(null);
            setSelectedEventId(null);
          }}
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
      </div>
    </TooltipProvider>
  );
};

export default Calendar;
