import { DayNumber, Hour, Minute } from './time-components';
import { WeekTime } from './WeekTime';

export type DayTime = Omit<WeekTime, 'dayNumber'>;

export type SameDayInterval = {
  dayNumber: DayNumber;
  start: DayTime;
  end: DayTime;
};

export const makeSameDayInterval = (
  dayNumber: DayNumber,
  start: [hour: Hour, minute: Minute],
  end: [hour: Hour, minute: Minute],
): SameDayInterval => ({
  dayNumber,
  start: { hour: start[0], minute: start[1] },
  end: { hour: end[0], minute: end[1] },
});

export type TimeInterval = {
  start: WeekTime;
  end: WeekTime;
};
