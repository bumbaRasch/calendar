import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CalendarEvent } from '../types/event';
import {
  EventCategory,
  EventPriority,
  EventStatus,
  eventUtils,
} from '../types/event';
import { RecurrenceEngine } from '../utils/recurrenceEngine';
import { RecurrenceEndType, RecurrenceFrequency } from '../types/recurrence';

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
  initializeSeedEvents: () => void;

  // Event filtering and searching
  searchEvents: (query: string) => CalendarEvent[];
  getEventsInRange: (start: string, end: string) => CalendarEvent[];

  // Recurring event operations
  updateRecurringEvent: (
    id: string,
    updates: Partial<CalendarEvent>,
    updateType: 'this' | 'thisAndFuture' | 'all',
  ) => void;
  deleteRecurringEvent: (
    id: string,
    deleteType: 'this' | 'thisAndFuture' | 'all',
  ) => void;
  getAllEventsWithRecurring: (start: string, end: string) => CalendarEvent[];
}

// Use the ID generator from eventUtils

export const useEventStore = create<EventState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial events data (empty, use initializeSeedEvents() to add test data)
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

        // Initialize with seed events (useful for development)
        initializeSeedEvents: () => {
          const seedEvents: CalendarEvent[] = [
            {
              id: 'seed-1',
              title: 'Team Meeting - Project Review',
              start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow at current time
              end: new Date(
                Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
              ).toISOString(), // +1 hour
              allDay: false,
              category: EventCategory.MEETING,
              priority: EventPriority.HIGH,
              status: EventStatus.CONFIRMED,
              description:
                'Weekly team meeting to review project progress, discuss blockers, and plan upcoming tasks. Please prepare your status updates.',
              location: 'Conference Room A / Zoom',
              attendees: [
                'john@company.com',
                'sarah@company.com',
                'mike@company.com',
              ],
              url: 'https://zoom.us/j/123456789',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'seed-2',
              title: 'Daily Standup',
              start: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000,
              ).toISOString(), // Day after tomorrow
              allDay: false,
              category: EventCategory.MEETING,
              priority: EventPriority.MEDIUM,
              status: EventStatus.CONFIRMED,
              description:
                'Daily standup meeting to sync on progress and blockers.',
              location: 'Zoom',
              attendees: ['team@company.com'],
              url: 'https://zoom.us/j/987654321',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              recurrence: {
                frequency: RecurrenceFrequency.DAILY,
                interval: 1,
                endType: RecurrenceEndType.NEVER,
                weekDays: [],
                exceptions: [],
              },
            },
          ];
          set({ events: seedEvents });
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

        // Update recurring event
        updateRecurringEvent: (id, updates, updateType) => {
          const event = get().getEventById(id);
          if (!event) return;

          if (updateType === 'this') {
            // Update only this instance
            if (event.recurrence?.parentEventId) {
              // This is an instance, update the parent's modifications
              const parentEvent = get().getEventById(
                event.recurrence.parentEventId,
              );
              if (parentEvent && parentEvent.recurrence) {
                const modifications =
                  parentEvent.recurrence.modifications || [];
                const existingMod = modifications.find(
                  (mod) => mod.originalDate === event.recurrence?.instanceDate,
                );

                if (existingMod) {
                  existingMod.modifiedEvent = {
                    ...existingMod.modifiedEvent,
                    ...updates,
                  };
                } else {
                  modifications.push({
                    originalDate: event.recurrence.instanceDate!,
                    modifiedEvent: updates,
                  });
                }

                set((state) => ({
                  events: state.events.map((e) =>
                    e.id === parentEvent.id
                      ? {
                          ...e,
                          recurrence: {
                            ...e.recurrence!,
                            modifications,
                          },
                        }
                      : e,
                  ),
                }));
              }
            }
          } else if (updateType === 'thisAndFuture') {
            // Update this and all future instances
            // This would require creating a new recurring event starting from this date
            // For now, we'll update the parent event
            if (event.recurrence?.parentEventId) {
              const parentId = event.recurrence.parentEventId;
              get().updateEvent(parentId, updates);
            } else {
              get().updateEvent(id, updates);
            }
          } else {
            // Update all instances
            const parentId = event.recurrence?.parentEventId || id;
            get().updateEvent(parentId, updates);
          }
        },

        // Delete recurring event
        deleteRecurringEvent: (id, deleteType) => {
          const event = get().getEventById(id);
          if (!event) return;

          if (deleteType === 'this') {
            // Delete only this instance
            if (
              event.recurrence?.parentEventId &&
              event.recurrence.instanceDate
            ) {
              // Mark this instance as deleted in the parent's modifications
              const parentEvent = get().getEventById(
                event.recurrence.parentEventId,
              );
              if (parentEvent && parentEvent.recurrence) {
                const modifications =
                  parentEvent.recurrence.modifications || [];
                const existingMod = modifications.find(
                  (mod) => mod.originalDate === event.recurrence?.instanceDate,
                );

                if (existingMod) {
                  existingMod.isDeleted = true;
                } else {
                  modifications.push({
                    originalDate: event.recurrence.instanceDate,
                    isDeleted: true,
                  });
                }

                set((state) => ({
                  events: state.events.map((e) =>
                    e.id === parentEvent.id
                      ? {
                          ...e,
                          recurrence: {
                            ...e.recurrence!,
                            modifications,
                          },
                        }
                      : e,
                  ),
                }));
              }
            }
          } else if (deleteType === 'thisAndFuture') {
            // Delete this and all future instances
            // This would require updating the recurrence end date
            if (
              event.recurrence?.parentEventId &&
              event.recurrence.instanceDate
            ) {
              const parentEvent = get().getEventById(
                event.recurrence.parentEventId,
              );
              if (parentEvent && parentEvent.recurrence) {
                const instanceDate = new Date(event.recurrence.instanceDate);
                instanceDate.setDate(instanceDate.getDate() - 1); // End before this instance

                set((state) => ({
                  events: state.events.map((e) =>
                    e.id === parentEvent.id
                      ? {
                          ...e,
                          recurrence: {
                            ...e.recurrence!,
                            endType: RecurrenceEndType.ON_DATE,
                            endDate: instanceDate.toISOString(),
                          },
                        }
                      : e,
                  ),
                }));
              }
            }
          } else {
            // Delete all instances
            const parentId = event.recurrence?.parentEventId || id;
            get().deleteEvent(parentId);
          }
        },

        // Get all events including recurring instances
        getAllEventsWithRecurring: (start, end) => {
          const allEvents: CalendarEvent[] = [];
          const processedParentIds = new Set<string>();

          get().events.forEach((event) => {
            if (event.recurrence && !event.recurrence.parentEventId) {
              // This is a parent recurring event
              processedParentIds.add(event.id);

              const instances = RecurrenceEngine.generateInstances(
                event,
                event.recurrence,
                new Date(start),
                new Date(end),
              );

              const eventInstances = RecurrenceEngine.createEventInstances(
                event,
                instances,
              );
              allEvents.push(...eventInstances);
            } else if (
              !event.recurrence ||
              !processedParentIds.has(event.recurrence.parentEventId || '')
            ) {
              // This is a regular event or a non-generated instance
              const eventStart = new Date(event.start);
              const eventEnd = event.end ? new Date(event.end) : eventStart;
              const startDate = new Date(start);
              const endDate = new Date(end);

              if (
                (eventStart >= startDate && eventStart <= endDate) ||
                (eventEnd >= startDate && eventEnd <= endDate) ||
                (eventStart <= startDate && eventEnd >= endDate)
              ) {
                allEvents.push(event);
              }
            }
          });

          return allEvents;
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
