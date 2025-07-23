import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import type { CalendarEvent } from '../types/event';
import { EventCategory, EventPriority, EventStatus, eventUtils } from '../types/event';

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventClick?: (clickInfo: EventClickArg) => void;
}

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

const Calendar: React.FC<CalendarProps> = ({ 
  events = [], 
  onDateSelect,
  onEventClick 
}) => {
  const [currentView, setCurrentView] = useState<CalendarView>('dayGridMonth');

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('calendar-view') as CalendarView;
    if (savedView && ['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'].includes(savedView)) {
      setCurrentView(savedView);
    }
  }, []);

  // Save view preference to localStorage when changed
  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    localStorage.setItem('calendar-view', view);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    } else {
      // Default behavior: create a simple event with category
      const title = prompt('Please enter a new title for your event');
      const calendarApi = selectInfo.view.calendar;

      calendarApi.unselect(); // clear date selection

      if (title) {
        const newEvent: CalendarEvent = {
          id: eventUtils.generateId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
          category: EventCategory.OTHER,
          priority: EventPriority.MEDIUM,
          status: EventStatus.CONFIRMED,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Convert to FullCalendar format and add
        calendarApi.addEvent(eventUtils.toFullCalendarEvent(newEvent));
      }
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      onEventClick(clickInfo);
    } else {
      // Default behavior: show event details and allow deletion
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove();
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
                ${currentView === button.key
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
        key={currentView} // Force re-render when view changes
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '' // We're using our custom view switcher
        }}
        initialView={currentView}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events ? events.map(eventUtils.toFullCalendarEvent) : []}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        aspectRatio={currentView === 'listWeek' ? 2.5 : 1.35}
        // List view specific options
        listDayFormat={{ weekday: 'long', month: 'long', day: 'numeric' }}
        listDaySideFormat={{ weekday: 'short' }}
        // Custom event display for different views
        eventDisplay={currentView === 'listWeek' ? 'list-item' : 'auto'}
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