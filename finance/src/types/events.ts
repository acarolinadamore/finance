export interface CalendarEvent {
  id: string;
  event_date: string;
  event_time: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEvent {
  event_date: string;
  event_time: string;
  description: string;
}
