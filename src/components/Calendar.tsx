import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { CalendarEvent } from '../types/event';
import { eventUtils } from '../types/event';
import { useUIStore } from '../stores/useUIStore';
import { useEventStore } from '../stores/useEventStore';

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventClick?: (clickInfo: EventClickArg) => void;
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
}) => {
  // Zustand stores
  const {
    calendarView,
    setCalendarView,
    setEventDialogOpen,
    setSelectedEventId,
  } = useUIStore();
  const { events: storeEvents, addEvent } = useEventStore();

  // Use store events if no props events provided
  const events = propEvents || storeEvents;

  // Save view preference to localStorage when changed
  const handleViewChange = (view: CalendarView) => {
    setCalendarView(view);
    localStorage.setItem('calendar-view', view);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    } else {
      // Default behavior: open event dialog with pre-filled data
      setSelectedEventId(null); // Clear any selected event for new event
      setEventDialogOpen(true);

      // Store the selection info for the dialog to use
      // For now, create a simple event as fallback
      const title = prompt('Please enter a new title for your event');
      const calendarApi = selectInfo.view.calendar;

      calendarApi.unselect(); // clear date selection

      if (title) {
        const newEventData = {
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        };

        // Add to store instead of directly to calendar
        addEvent(newEventData);
      }
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      onEventClick(clickInfo);
    } else {
      // Default behavior: open event dialog for editing
      const eventId = clickInfo.event.id;
      if (eventId) {
        setSelectedEventId(eventId);
        setEventDialogOpen(true);
      }
    }
  };

  const viewButtons = [
    { key: 'dayGridMonth', label: 'Month', icon: '📅' },
    { key: 'timeGridWeek', label: 'Week', icon: '📊' },
    { key: 'timeGridDay', label: 'Day', icon: '📋' },
    { key: 'listWeek', label: 'List', icon: '📝' },
  ] as const;

  return (
    <div className="calendar-container">
      {/* Custom View Switcher */}
      <div className="calendar-view-switcher mb-4">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {viewButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleViewChange(button.key)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  calendarView === button.key
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                }
              `}
            >
              <span className="text-base">{button.icon}</span>
              <span className="hidden sm:inline">{button.label}</span>
              <span className="sm:hidden">{button.label.slice(0, 1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FullCalendar Component */}
      <FullCalendar
        key={calendarView} // Force re-render when view changes
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '', // We're using our custom view switcher
        }}
        initialView={calendarView}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events ? events.map(eventUtils.toFullCalendarEvent) : []}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={calendarView === 'listWeek' ? 2.5 : 1.35}
        // List view specific options
        listDayFormat={{ weekday: 'long', month: 'long', day: 'numeric' }}
        listDaySideFormat={{ weekday: 'short' }}
        // Custom event display for different views
        eventDisplay={calendarView === 'listWeek' ? 'list-item' : 'auto'}
        // View-specific configurations
        views={{
          dayGridMonth: {
            dayMaxEvents: 3,
            moreLinkText: 'more',
          },
          timeGridWeek: {
            slotMinTime: '06:00:00',
            slotMaxTime: '22:00:00',
            allDaySlot: true,
          },
          timeGridDay: {
            slotMinTime: '06:00:00',
            slotMaxTime: '22:00:00',
            allDaySlot: true,
          },
          listWeek: {
            listDayFormat: { weekday: 'long', month: 'short', day: 'numeric' },
            noEventsText: 'No events to display',
          },
        }}
      />
    </div>
  );
};

export default Calendar;
