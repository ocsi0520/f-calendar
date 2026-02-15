import { EventApi } from "@fullcalendar/core/index.js";

export const dayByNumber = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
} as const;

export type DayNumber = keyof typeof dayByNumber;

export type EventDescriptor = Pick<EventApi, 'start' | 'end'>;
