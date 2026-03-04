import { EventApi } from '@fullcalendar/core/index.js';

export type CalendarEventDescriptor = Pick<EventApi, 'start' | 'end' | 'title'>;
