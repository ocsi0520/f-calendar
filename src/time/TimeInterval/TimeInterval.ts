import type { EventInput } from '@fullcalendar/core/index.js';
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

  public toString(): string {
    return `${this.dayNumber}T${this.timeToString(this.start)}_-_${this.timeToString(this.end)}`;
  }
  private withLeading0(number: Number): string {
    return number.toString(10).padStart(2, '0');
  }
  private timeToString([hour, minute]: Time): string {
    return this.withLeading0(hour) + ':' + this.withLeading0(minute);
  }

  public toEventWith(baseDate: Date, title?: string): EventInput {
    const mondayMidnightOfThatWeek = this.getMondayMidnightOfWeekAt(baseDate);

    const newEvent: EventInput = {
      title: title || 'Meeting',
      start: this.getExactDate(mondayMidnightOfThatWeek, this.start),
      end: this.getExactDate(mondayMidnightOfThatWeek, this.end),
      color: 'lightblue',
      id: this.toString(),
    };
    return newEvent;
  }

  public isSameInterval(other: TimeInterval): boolean {
    return this.toString() === other.toString();
  }

  private getMondayMidnightOfWeekAt(baseDate: Date): Date {
    const mondayMidnightOfThatWeek = new Date(baseDate);
    const dayDiffFromMonday = (baseDate.getDay() || 7) - 1;
    mondayMidnightOfThatWeek.setDate(mondayMidnightOfThatWeek.getDate() - dayDiffFromMonday);
    mondayMidnightOfThatWeek.setHours(0, 0);
    return mondayMidnightOfThatWeek;
  }
  private getExactDate(mondayMidnightOfThatWeek: Date, [hours, minutes]: Time): Date {
    const exactDate = new Date(mondayMidnightOfThatWeek);
    exactDate.setDate(exactDate.getDate() + this.dayNumber - 1);
    exactDate.setHours(hours, minutes);
    return exactDate;
  }
}
