import type { EventApi, EventInput } from '@fullcalendar/core/index.js';
import type { Hour, Minute, Time } from '../Time';
import { Injectable } from '@angular/core';

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

const localeOptions = {
  locale: new Intl.Locale('HU'),
  formatOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } satisfies Intl.DateTimeFormatOptions,
} as const;

const PRIVATE_CONSTRUCTOR_SYMBOL = Symbol();

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalFactory {
  private static TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  private static TIME_DIVIDER = '_-_';

  public createOf(wholeIntervalString: string): TimeInterval;
  public createOf(eventDescriptor: EventDescriptor): TimeInterval;
  public createOf(input: string | EventDescriptor): TimeInterval {
    return typeof input === 'string'
      ? this.createFromFormattedString(input)
      : this.createFromEventDescriptor(input);
  }

  private createFromEventDescriptor(eventDescriptor: EventDescriptor): TimeInterval {
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

    return TimeInterval[PRIVATE_CONSTRUCTOR_SYMBOL](
      this.getDayNumberFrom(eventDescriptor.start),
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }
  private createFromFormattedString(wholeIntervalString: string): TimeInterval {
    const [dayNumberString, timesPart] = this.validateParts(
      wholeIntervalString.split('T'),
      wholeIntervalString,
    );

    const numberOfDay = this.validateNumberOfDay(this.parsePositiveIntStrict(dayNumberString));

    const [startString, endString] = this.validateParts(
      timesPart.split(TimeIntervalFactory.TIME_DIVIDER),
      wholeIntervalString,
    );

    return TimeInterval[PRIVATE_CONSTRUCTOR_SYMBOL](
      numberOfDay,
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }
  private parsePositiveIntStrict(value: string, allowLeading0 = false): number {
    const valueToCheck = allowLeading0 && value.startsWith('0') ? value.slice(1) : value;

    if (!/^\d+$/.test(valueToCheck)) {
      throw new Error(`Invalid integer: "${valueToCheck}"`);
    }

    return Number(valueToCheck);
  }

  private validateParts(parts: string[], wholeIntervalString: string): [string, string] {
    if (parts.length !== 2)
      throw new Error('Invalid string format for interval: ' + wholeIntervalString);
    return parts as [string, string];
  }
  private validateNumberOfDay(rawDayNumber: number): DayNumber {
    if (rawDayNumber < 1 || rawDayNumber > 7) throw new Error('Invalid DayNumber: ' + rawDayNumber);
    return rawDayNumber as DayNumber;
  }

  private convertToTime(timeString: string): Time {
    const result = timeString.match(TimeIntervalFactory.TIME_REGEX);
    if (result?.length !== 3) throw new Error('Invalid time string: ' + timeString);

    return [
      this.parsePositiveIntStrict(result[1], true) as Hour,
      this.parsePositiveIntStrict(result[2], true) as Minute,
    ];
  }

  private getDayNumberFrom(date: Date): DayNumber {
    return (date.getDay() || 7) as DayNumber;
  }
}

export class TimeInterval {
  private constructor(
    public readonly dayNumber: DayNumber,
    public readonly start: Time,
    public readonly end: Time,
  ) {}

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

  public static [PRIVATE_CONSTRUCTOR_SYMBOL](
    dayNumber: DayNumber,
    start: Time,
    end: Time,
  ): TimeInterval {
    return new TimeInterval(dayNumber, start, end);
  }
}
