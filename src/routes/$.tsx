import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Route Not Found
        </h1>
        <p className="text-gray-600 mb-4">
          The requested route could not be found.
        </p>
        <p className="text-sm text-gray-400">
          Current path: {window.location.pathname}
        </p>
        <div className="mt-6">
          <a
            href="/calendar/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Calendar
          </a>
        </div>
      </div>
    </div>
  ),
});
