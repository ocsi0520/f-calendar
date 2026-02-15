import type { Hour, Minute, Time } from '../Time';
import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
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

    return new TimeInterval(
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

    return new TimeInterval(
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
