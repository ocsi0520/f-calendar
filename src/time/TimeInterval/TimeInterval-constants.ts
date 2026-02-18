import { EventApi } from '@fullcalendar/core/index.js';

export const dayNumbers = [1, 2, 3, 4, 5, 6, 7] as const;
export type DayNumber = (typeof dayNumbers)[number];
export type EventDescriptor = Pick<EventApi, 'start' | 'end'>;
