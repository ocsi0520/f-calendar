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

  public isSameInterval({ dayNumber, start, end }: TimeInterval): boolean {
    return (
      this.dayNumber === dayNumber &&
      this.start[0] === start[0] &&
      this.start[1] === start[1] &&
      this.end[0] === end[0] &&
      this.end[1] === end[1]
    );
  }
}
