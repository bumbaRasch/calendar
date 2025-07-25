import React from 'react';
import { Button } from './ui/button';
import { useEventStore } from '../stores/useEventStore';
import { RefreshCw, Trash2, Plus } from 'lucide-react';

const DevTools: React.FC = () => {
  const { events, clearEvents, initializeSeedEvents } = useEventStore();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
      <div className="text-xs font-medium text-gray-600 mb-2">
        Dev Tools ({events.length} events)
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={initializeSeedEvents}
          className="flex items-center gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          Add Seeds
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={clearEvents}
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
