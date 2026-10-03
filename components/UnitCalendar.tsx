'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css' 
import CalendarEventDetailsModal from './CalendarEventDetailsModal'

import { calendarService } from '@/services/calendarService'
import { CalendarEvent } from '@/types/calendar'
import CalendarEventModal from './CalendarEventModal'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// List of vibrant Tailwind colors for tasks
const EVENT_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700'
];

// Helper function to assign a consistent color based on the task's ID
const eventStyleGetter = (event: CalendarEvent) => {
  let hash = 0;
  const str = event.id;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % EVENT_COLORS.length;
  
  return {
    className: EVENT_COLORS[colorIndex]
  };
};

export default function UnitCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // NEW: Controlled state for the calendar's view and date
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await calendarService.getEvents()
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        description: event.description,
      }))
      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setSelectedSlot({ start, end })
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (title: string, description: string) => {
    if (selectedSlot) {
      try {
        await calendarService.createEvent({
          title,
          description,
          start_time: selectedSlot.start.toISOString(),
          end_time: selectedSlot.end.toISOString(),
        })
        loadEvents() 
        setIsModalOpen(false)
      } catch (error) {
        console.error("Failed to create event:", error)
        alert("Failed to save the event.")
      }
    }
  }

  // NEW: State for the Details Modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // UPDATED: Open the details modal instead of deleting immediately
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDetailsModalOpen(true)
  }

  // NEW: Dedicated delete handler passed to the modal
  const handleDeleteEvent = async (id: string) => {
    try {
      await calendarService.deleteEvent(id)
      loadEvents()
      setIsDetailsModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Failed to delete event:", error)
      alert("Failed to delete the event.")
    }
  }

  if (isLoading) return <div className="p-4 text-gray-500 font-medium animate-pulse">Loading calendar...</div>

  return (
    <div className="h-[600px] w-full relative bg-white">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        
        // NEW: Tell the calendar exactly which views are allowed
        views={['month', 'week', 'day', 'agenda']}
        
        // NEW: Bind the controlled state to the calendar
        view={view}
        onView={(newView) => setView(newView)}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
        
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        className="font-sans text-sm text-gray-700"
      />
      
      <CalendarEventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedSlot?.start || null}
      />
<CalendarEventDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
      />

    </div>
  )
}