export type EventType =
  | 'cron'
  | 'task_deadline'
  | 'user_event'
  | 'agent_task'
  | 'milestone';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  color?: string;
  relatedId?: string;
}
