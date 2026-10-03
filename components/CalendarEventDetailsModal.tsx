'use client'

import { CalendarEvent } from '@/types/calendar'

interface CalendarEventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  event: CalendarEvent | null;
}

export default function CalendarEventDetailsModal({ isOpen, onClose, onDelete, event }: CalendarEventDetailsModalProps) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Start:</span> {event.start.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">End:</span> {event.end.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 min-h-[80px] whitespace-pre-wrap border border-gray-100">
            {event.description || 'No description provided.'}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this event?')) {
                onDelete(event.id);
              }
            }}
            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            Delete Event
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}