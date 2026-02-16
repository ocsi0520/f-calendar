import { inject, Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { EventInput } from '@fullcalendar/core/index.js';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import type { Hour, Minute, Time } from '../Time';
import { DayNumber, EventDescriptor } from './TimeInterval-constants';

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
export class TimeIntervalEventMapper {
  private primitiveMapper = inject(TimeIntervalPrimitiveMapper);

  public mapFromEvent(eventDescriptor: EventDescriptor): TimeInterval {
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

    return new TimeInterval(
      this.getDayNumberFrom(eventDescriptor.start),
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }

  public mapToEvent(timeInterval: TimeInterval, baseDate: Date, title?: string): EventInput {
    const mondayMidnightOfThatWeek = this.getMondayMidnightOfWeekAt(baseDate);

    const newEvent: EventInput = {
      title: title || 'Meeting',
      start: this.getExactDate(timeInterval, 'start', mondayMidnightOfThatWeek),
      end: this.getExactDate(timeInterval, 'end', mondayMidnightOfThatWeek),
      color: 'lightblue',
      id: this.primitiveMapper.mapToString(timeInterval),
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

  private convertToTime(timeString: string): Time {
    const TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const result = timeString.match(TIME_REGEX);
    if (result?.length !== 3) throw new Error('Invalid time string: ' + timeString);

    return [
      this.parsePositiveIntStrict(result[1], true) as Hour,
      this.parsePositiveIntStrict(result[2], true) as Minute,
    ];
  }

  // TODO: unnecessary as TIME_REGEX anyway narrow down
  private parsePositiveIntStrict(value: string, allowLeading0 = false): number {
    const valueToCheck = allowLeading0 && value.startsWith('0') ? value.slice(1) : value;

    if (!/^\d+$/.test(valueToCheck)) {
      throw new Error(`Invalid integer: "${valueToCheck}"`);
    }

    return Number(valueToCheck);
  }

  private getDayNumberFrom(date: Date): DayNumber {
    return (date.getDay() || 7) as DayNumber;
  }
}
