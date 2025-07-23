import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events')({
  component: EventsPage,
})

function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600 mt-2">Manage and view all your events</p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Event Management</h2>
          <p className="text-gray-600">Event list and management features will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}