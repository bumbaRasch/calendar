import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CalendarEvent } from '../types/event';
import {
  EventCategory,
  EventPriority,
  EventStatus,
  eventUtils,
} from '../types/event';

interface EventState {
  // Events data
  events: CalendarEvent[];

  // Event CRUD operations
  addEvent: (
    event: Partial<CalendarEvent> & { title: string; start: string },
  ) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => CalendarEvent | undefined;

  // Bulk operations
  setEvents: (events: CalendarEvent[]) => void;
  clearEvents: () => void;

  // Event filtering and searching
  searchEvents: (query: string) => CalendarEvent[];
  getEventsInRange: (start: string, end: string) => CalendarEvent[];
}

// Use the ID generator from eventUtils

export const useEventStore = create<EventState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial events data
        events: [],

        // Add new event
        addEvent: (eventData) => {
          const newEvent: CalendarEvent = {
            ...eventData,
            id: eventUtils.generateId(),
            category: eventData.category || EventCategory.OTHER,
            priority: eventData.priority || EventPriority.MEDIUM,
            status: eventData.status || EventStatus.CONFIRMED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            events: [...state.events, newEvent],
          }));
        },

        // Update existing event
        updateEvent: (id, updates) => {
          set((state) => ({
            events: state.events.map((event) =>
              event.id === id
                ? { ...event, ...updates, updatedAt: new Date().toISOString() }
                : event,
            ),
          }));
        },

        // Delete event
        deleteEvent: (id) => {
          set((state) => ({
            events: state.events.filter((event) => event.id !== id),
          }));
        },

        // Get event by ID
        getEventById: (id) => {
          return get().events.find((event) => event.id === id);
        },

        // Set all events
        setEvents: (events) => {
          set({ events });
        },

        // Clear all events
        clearEvents: () => {
          set({ events: [] });
        },

        // Search events by title or description
        searchEvents: (query) => {
          const lowercaseQuery = query.toLowerCase();
          return get().events.filter(
            (event) =>
              event.title.toLowerCase().includes(lowercaseQuery) ||
              event.description?.toLowerCase().includes(lowercaseQuery),
          );
        },

        // Get events in date range
        getEventsInRange: (start, end) => {
          const startDate = new Date(start);
          const endDate = new Date(end);

          return get().events.filter((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : eventStart;

            return (
              (eventStart >= startDate && eventStart <= endDate) ||
              (eventEnd >= startDate && eventEnd <= endDate) ||
              (eventStart <= startDate && eventEnd >= endDate)
            );
          });
        },
      }),
      {
        name: 'event-store',
        // Only persist the events data
        partialize: (state) => ({ events: state.events }),
      },
    ),
    {
      name: 'event-store',
    },
  ),
);
