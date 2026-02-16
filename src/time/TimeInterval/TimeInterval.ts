import type { Time } from '../Time';
import { DayNumber } from './TimeInterval-constants';

export class TimeInterval {
  public constructor(
    public readonly dayNumber: DayNumber,
    public readonly start: Time,
    public readonly end: Time,
  ) {}

  public getInAbsoluteMinutes(time: 'start' | 'end'): number {
    return this[time][0] * 60 + this[time][1];
  }
}

export const isSameInterval = (t1: TimeInterval, t2: TimeInterval): boolean => {
  return (
    t1.dayNumber === t2.dayNumber &&
    t1.start[0] === t2.start[0] &&
    t1.start[1] === t2.start[1] &&
    t1.end[0] === t2.end[0] &&
    t1.end[1] === t2.end[1]
  );
};
