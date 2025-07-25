import React from 'react';
import { Button } from './ui/button';
import { useEventStore } from '../stores/useEventStore';
import { RefreshCw, Trash2, Plus } from 'lucide-react';

const DevTools: React.FC = () => {
  const { events, clearEvents, initializeSeedEvents } = useEventStore();

  // Development tools component

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-yellow-200 border-4 border-yellow-600 rounded-lg shadow-2xl p-4 min-w-[280px]">
      <div className="text-sm font-bold text-red-700 mb-3 text-center">
        🛠️ DEV TOOLS 🛠️
      </div>
      <div className="text-xs font-medium text-gray-800 mb-3 bg-white p-2 rounded">
        Current Events:{' '}
        <span className="font-bold text-blue-600">{events.length}</span>
        <br />
        <span className="text-gray-500">
          Click &quot;Add Seeds&quot; to add test events
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            initializeSeedEvents();
            // Check events after a small delay
            setTimeout(() => {
              const newEvents = useEventStore.getState().events;
              // Navigate calendar to today to show the seed events
              if (newEvents.length > 0) {
                // Calendar should automatically show events with array-based approach
              }
            }, 100);
          }}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Seeds
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            clearEvents();
          }}
          className="flex items-center gap-1 text-xs"
        >
          <Trash2 className="h-3 w-3" />
          Clear All
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            // Clear localStorage and reload
            localStorage.removeItem('event-store');
            window.location.reload();
          }}
          className="flex items-center gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default DevTools;
