import type { Hour, Minute, Time } from '../Time';
import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { DayNumber } from './TimeInterval-constants';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalPrimitiveMapper {
  private static TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  private static TIME_DIVIDER = '_-_';

  public mapToString(timeInterval: TimeInterval): string {
    return `${timeInterval.dayNumber}T${this.timeToString(timeInterval.start)}_-_${this.timeToString(timeInterval.end)}`;
  }

  public mapFromString(wholeIntervalString: string): TimeInterval {
    const [dayNumberString, timesPart] = this.validateParts(
      wholeIntervalString.split('T'),
      wholeIntervalString,
    );

    const numberOfDay = this.validateNumberOfDay(this.parsePositiveIntStrict(dayNumberString));

    const [startString, endString] = this.validateParts(
      timesPart.split(TimeIntervalPrimitiveMapper.TIME_DIVIDER),
      wholeIntervalString,
    );

    return new TimeInterval(
      numberOfDay,
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }

  private withLeading0(number: Number): string {
    return number.toString(10).padStart(2, '0');
  }

  private timeToString([hour, minute]: Time): string {
    return this.withLeading0(hour) + ':' + this.withLeading0(minute);
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
    const result = timeString.match(TimeIntervalPrimitiveMapper.TIME_REGEX);
    if (result?.length !== 3) throw new Error('Invalid time string: ' + timeString);

    return [
      this.parsePositiveIntStrict(result[1], true) as Hour,
      this.parsePositiveIntStrict(result[2], true) as Minute,
    ];
  }
}
