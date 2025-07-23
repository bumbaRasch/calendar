import { createFileRoute } from '@tanstack/react-router'
import Calendar from '../components/Calendar'
import type { CalendarEvent } from '../types/event'
import { EventCategory, EventPriority, EventStatus } from '../types/event'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // Enhanced sample events with categories and details
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Standup Meeting',
      start: new Date().toISOString().split('T')[0] + 'T10:00:00',
      end: new Date().toISOString().split('T')[0] + 'T10:30:00',
      allDay: false,
      category: EventCategory.MEETING,
      priority: EventPriority.HIGH,
      status: EventStatus.CONFIRMED,
      description: 'Daily team standup to discuss progress and blockers',
      location: 'Conference Room A',
      attendees: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Project Manager',
    },
    {
      id: '2',
      title: 'Product Launch Deadline',
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allDay: true,
      category: EventCategory.WORK,
      priority: EventPriority.URGENT,
      status: EventStatus.CONFIRMED,
      description: 'Final deadline for product version 2.0 launch',
      location: 'Remote',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Product Owner',
    },
    {
      id: '3',
      title: 'Client Presentation',
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T14:00:00',
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T15:30:00',
      allDay: false,
      category: EventCategory.MEETING,
      priority: EventPriority.HIGH,
      status: EventStatus.CONFIRMED,
      description: 'Quarterly business review presentation to key client',
      location: 'Client Office - Downtown',
      attendees: ['Sarah Wilson', 'Mike Chen', 'Client Team'],
      url: 'https://meet.google.com/abc-defg-hij',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Sales Manager',
    },
    {
      id: '4',
      title: 'Doctor Appointment',
      start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00:00',
      end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00:00',
      allDay: false,
      category: EventCategory.HEALTH,
      priority: EventPriority.MEDIUM,
      status: EventStatus.CONFIRMED,
      description: 'Annual health checkup',
      location: 'Medical Center',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'Weekend Trip to Mountains',
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      allDay: true,
      category: EventCategory.TRAVEL,
      priority: EventPriority.LOW,
      status: EventStatus.TENTATIVE,
      description: 'Hiking and camping trip with family',
      location: 'Rocky Mountain National Park',
      attendees: ['Family Members'],
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      title: 'JavaScript Workshop',
      start: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T13:00:00',
      end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T17:00:00',
      allDay: false,
      category: EventCategory.EDUCATION,
      priority: EventPriority.MEDIUM,
      status: EventStatus.CONFIRMED,
      description: 'Advanced JavaScript patterns and performance workshop',
      location: 'Tech Hub',
      attendees: ['Development Team'],
      url: 'https://techhub.com/workshops/js-advanced',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      title: 'Birthday Party',
      start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T18:00:00',
      end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T22:00:00',
      allDay: false,
      category: EventCategory.SOCIAL,
      priority: EventPriority.MEDIUM,
      status: EventStatus.CONFIRMED,
      description: "Friend's 30th birthday celebration",
      location: 'Downtown Restaurant',
      attendees: ['Friends Group'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      title: 'Grocery Shopping',
      start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T11:00:00',
      end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T12:00:00',
      allDay: false,
      category: EventCategory.PERSONAL,
      priority: EventPriority.LOW,
      status: EventStatus.CONFIRMED,
      description: 'Weekly grocery run and meal prep shopping',
      location: 'Whole Foods Market',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Manage your events and schedule</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Calendar events={sampleEvents} />
      </div>
    </div>
  )
}
