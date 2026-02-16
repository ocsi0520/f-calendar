import type { Time } from '../Time';
import { DayNumber } from './TimeInterval-constants';

export type TimeInterval = {
  readonly dayNumber: DayNumber;
  readonly start: Time;
  readonly end: Time;
};

export const isSameInterval = (t1: TimeInterval, t2: TimeInterval): boolean => {
  return (
    t1.dayNumber === t2.dayNumber &&
    t1.start[0] === t2.start[0] &&
    t1.start[1] === t2.start[1] &&
    t1.end[0] === t2.end[0] &&
    t1.end[1] === t2.end[1]
  );
};
