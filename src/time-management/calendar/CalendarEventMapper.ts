import { Injectable } from '@angular/core';
import { EventInput } from '@fullcalendar/core/index.js';
import { DayNumber } from '../definition/time-components';
import { SameDayInterval } from '../definition/TimeInterval';
import { CalendarEventDescriptor } from './event-descriptor';
import { SameDayIntervalMapper } from '../mappers/SameDayIntervalMapper';
import { Session } from '../session';
import { TimeMapper } from '../mappers/TimeMapper';

const localeOptions = {
  locale: new Intl.Locale('HU'),
  formatOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } satisfies Intl.DateTimeFormatOptions,
} as const;

@Injectable({
  providedIn: 'root',
})
export class CalendarEventMapper {
  constructor(
    private sameDayIntervalMapper: SameDayIntervalMapper,
    private timeMapper: TimeMapper,
  ) {}

  public mapFromEvent(eventDescriptor: CalendarEventDescriptor): Session {
    if (!eventDescriptor.start || !eventDescriptor.end)
      throw new Error('invalid eventDescriptor: ' + JSON.stringify(eventDescriptor));
    if (this.getDayNumberFrom(eventDescriptor.start) !== this.getDayNumberFrom(eventDescriptor.end))
      throw new Error('does not allow multi-day intervals');

    const startString = eventDescriptor.start.toLocaleTimeString(
      localeOptions.locale,
      localeOptions.formatOptions,
    );
    const endString = eventDescriptor.end.toLocaleTimeString(
      localeOptions.locale,
      localeOptions.formatOptions,
    );

    return {
      displayName: eventDescriptor.title,
      interval: {
        dayNumber: this.getDayNumberFrom(eventDescriptor.start),
        start: this.timeMapper.dayTimeFromString(startString),
        end: this.timeMapper.dayTimeFromString(endString),
      },
    };
  }

  public mapToEvent({ interval, displayName }: Session, baseDate: Date): EventInput {
    const mondayMidnightOfThatWeek = this.getMondayMidnightOfWeekAt(baseDate);

    const newEvent: EventInput = {
      title: displayName,
      start: this.getExactDate(interval, 'start', mondayMidnightOfThatWeek),
      end: this.getExactDate(interval, 'end', mondayMidnightOfThatWeek),
      color: 'purple',
      id: this.sameDayIntervalMapper.mapToString(interval),
    };
    return newEvent;
  }

  private getMondayMidnightOfWeekAt(baseDate: Date): Date {
    const mondayMidnightOfThatWeek = new Date(baseDate);
    const dayDiffFromMonday = (baseDate.getDay() || 7) - 1;
    mondayMidnightOfThatWeek.setDate(mondayMidnightOfThatWeek.getDate() - dayDiffFromMonday);
    mondayMidnightOfThatWeek.setHours(0, 0);
    return mondayMidnightOfThatWeek;
  }

  private getExactDate(
    SameDayInterval: SameDayInterval,
    whichEnding: 'start' | 'end',
    mondayMidnightOfThatWeek: Date,
  ): Date {
    const { hour, minute } = SameDayInterval[whichEnding];
    const exactDate = new Date(mondayMidnightOfThatWeek);
    exactDate.setDate(exactDate.getDate() + SameDayInterval.dayNumber - 1);
    exactDate.setHours(hour, minute);
    return exactDate;
  }

  private getDayNumberFrom(date: Date): DayNumber {
    return (date.getDay() || 7) as DayNumber;
  }
}
