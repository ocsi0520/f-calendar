import type { Hour, Minute, Time } from '../Time';
import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { DayNumber } from './TimeInterval-constants';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalPrimitiveMapper {
  private static readonly TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  private static readonly TIME_DIVIDER = '_-_';
  private static readonly DAY_IN_MINUTES = 24 * 60;
  private static readonly HOUR_IN_MINUTES = 60;

  private static readonly MAXIMUM_MINS_FROM_MONDAY_MIDNIGHT = 6 * 24 * 60 + 23 * 60 + 59;
  public static readonly NUMBER_BASE =
    TimeIntervalPrimitiveMapper.MAXIMUM_MINS_FROM_MONDAY_MIDNIGHT + 1;
  private static readonly MAXIMUM_VALID_ENCODED_NUMBER =
    TimeIntervalPrimitiveMapper.NUMBER_BASE ** 2 - 1;

  public mapToNumber({ start, end, dayNumber }: TimeInterval): number {
    const startFromMondayMidnight = (dayNumber - 1) * 24 * 60 + start[0] * 60 + start[1];
    const endFromMondayMidnight = (dayNumber - 1) * 24 * 60 + end[0] * 60 + end[1];
    return (
      startFromMondayMidnight * TimeIntervalPrimitiveMapper.NUMBER_BASE + endFromMondayMidnight
    );
  }
  public mapFromNumber(encodedNumber: number): TimeInterval {
    if (
      encodedNumber > TimeIntervalPrimitiveMapper.MAXIMUM_VALID_ENCODED_NUMBER ||
      encodedNumber < 0
    )
      throw new Error('Invalid encoded number');
    const encodedStart = Math.floor(encodedNumber / TimeIntervalPrimitiveMapper.NUMBER_BASE);
    const encodedEnd = encodedNumber % TimeIntervalPrimitiveMapper.NUMBER_BASE;

    const [startDayNumber, startTime] = this.mapTimeFromNumber(encodedStart);
    const [endDayNumber, endTime] = this.mapTimeFromNumber(encodedEnd);
    if (endDayNumber !== startDayNumber || startDayNumber < 1 || startDayNumber > 7)
      throw new Error('Invalid day number');

    return {
      dayNumber: startDayNumber,
      start: startTime,
      end: endTime,
    };
  }

  private mapTimeFromNumber(timeNumber: number): [DayNumber, Time] {
    let remnant = timeNumber;
    const daysPassed = Math.floor(timeNumber / TimeIntervalPrimitiveMapper.DAY_IN_MINUTES);
    remnant -= daysPassed * TimeIntervalPrimitiveMapper.DAY_IN_MINUTES;
    const hours = Math.floor(remnant / TimeIntervalPrimitiveMapper.HOUR_IN_MINUTES) as Hour;
    remnant -= hours * TimeIntervalPrimitiveMapper.HOUR_IN_MINUTES;
    const minutes = remnant as Minute;
    return [(daysPassed + 1) as DayNumber, [hours, minutes]];
  }

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

    return {
      dayNumber: numberOfDay,
      start: this.convertToTime(startString),
      end: this.convertToTime(endString),
    };
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
