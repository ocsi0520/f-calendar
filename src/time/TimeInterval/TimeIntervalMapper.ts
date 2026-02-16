import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { Time } from '../Time';
import { EventInput } from '@fullcalendar/core/index.js';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalMapper {
  public mapToString(timeInterval: TimeInterval): string {
    return `${timeInterval.dayNumber}T${this.timeToString(timeInterval.start)}_-_${this.timeToString(timeInterval.end)}`;
  }

  public mapToEvent(timeInterval: TimeInterval, baseDate: Date, title?: string): EventInput {
    const mondayMidnightOfThatWeek = this.getMondayMidnightOfWeekAt(baseDate);

    const newEvent: EventInput = {
      title: title || 'Meeting',
      start: this.getExactDate(timeInterval, 'start', mondayMidnightOfThatWeek),
      end: this.getExactDate(timeInterval, 'end', mondayMidnightOfThatWeek),
      color: 'lightblue',
      id: this.mapToString(timeInterval),
    };
    return newEvent;
  }

  private withLeading0(number: Number): string {
    return number.toString(10).padStart(2, '0');
  }
  private timeToString([hour, minute]: Time): string {
    return this.withLeading0(hour) + ':' + this.withLeading0(minute);
  }

  private getMondayMidnightOfWeekAt(baseDate: Date): Date {
    const mondayMidnightOfThatWeek = new Date(baseDate);
    const dayDiffFromMonday = (baseDate.getDay() || 7) - 1;
    mondayMidnightOfThatWeek.setDate(mondayMidnightOfThatWeek.getDate() - dayDiffFromMonday);
    mondayMidnightOfThatWeek.setHours(0, 0);
    return mondayMidnightOfThatWeek;
  }
  private getExactDate(
    timeInterval: TimeInterval,
    whichEnding: 'start' | 'end',
    mondayMidnightOfThatWeek: Date,
  ): Date {
    const [hours, minutes] = timeInterval[whichEnding];
    const exactDate = new Date(mondayMidnightOfThatWeek);
    exactDate.setDate(exactDate.getDate() + timeInterval.dayNumber - 1);
    exactDate.setHours(hours, minutes);
    return exactDate;
  }
}
