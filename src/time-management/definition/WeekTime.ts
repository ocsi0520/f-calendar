import { DayNumber, Hour, Minute } from './time-components';

export type WeekTime = {
  dayNumber: DayNumber;
  hour: Hour;
  minute: Minute;
};

export const makeWeekTime = (dayNumber: DayNumber, hour: Hour, minute: Minute): WeekTime => ({
  dayNumber,
  hour,
  minute,
});
