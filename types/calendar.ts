export interface UnitEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by?: string;
  created_at?: string;
}

// Type specifically for react-big-calendar format
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}