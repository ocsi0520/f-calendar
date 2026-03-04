import { Injectable } from '@angular/core';
import { DayTime, SameDayInterval } from '../definition/TimeInterval';
import { TimeMapper } from './TimeMapper';
import { DayNumber, Hour, Minute } from '../definition/time-components';

const TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_DIVIDER = '_-_';

const NUMBER_BASE = 7 * 24 * 60;
const MAXIMUM_VALID_ENCODED_NUMBER = NUMBER_BASE ** 2 - 1;

@Injectable({
  providedIn: 'root',
})
export class SameDayIntervalMapper {
  constructor(private timeMapper: TimeMapper) {}

  public mapToNumber({ start, end, dayNumber }: SameDayInterval): number {
    const startFromMondayMidnight = this.timeMapper.weekTimeToNumber({ dayNumber, ...start });
    const endFromMondayMidnight = this.timeMapper.weekTimeToNumber({ dayNumber, ...end });
    return startFromMondayMidnight * NUMBER_BASE + endFromMondayMidnight;
  }

  public mapFromNumber(encodedNumber: number): SameDayInterval {
    if (encodedNumber > MAXIMUM_VALID_ENCODED_NUMBER || encodedNumber < 0)
      throw new Error('Invalid encoded number');
    const encodedStart = Math.floor(encodedNumber / NUMBER_BASE);
    const encodedEnd = encodedNumber % NUMBER_BASE;

    const startTime = this.timeMapper.weekTimeFromNumber(encodedStart);
    const endTime = this.timeMapper.weekTimeFromNumber(encodedEnd);

    if (startTime.dayNumber !== endTime.dayNumber)
      throw new Error(
        `SameDayInterval: not the same day ${startTime.dayNumber} & ${endTime.dayNumber}`,
      );

    return {
      dayNumber: startTime.dayNumber,
      start: { hour: startTime.hour, minute: startTime.minute },
      end: { hour: endTime.hour, minute: endTime.minute },
    };
  }

  public mapToString(SameDayInterval: SameDayInterval): string {
    return `${SameDayInterval.dayNumber}T${this.timeToString(SameDayInterval.start)}_-_${this.timeToString(SameDayInterval.end)}`;
  }

  public mapFromString(wholeIntervalString: string): SameDayInterval {
    const [dayNumberString, timesPart] = this.validateParts(
      wholeIntervalString.split('T'),
      wholeIntervalString,
    );

    const numberOfDay = this.validateNumberOfDay(this.parsePositiveIntStrict(dayNumberString));

    const [startString, endString] = this.validateParts(
      timesPart.split(TIME_DIVIDER),
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

  private timeToString({ hour, minute }: DayTime): string {
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

  private convertToTime(timeString: string): DayTime {
    const result = timeString.match(TIME_REGEX);
    if (result?.length !== 3) throw new Error('Invalid time string: ' + timeString);

    return {
      hour: this.parsePositiveIntStrict(result[1], true) as Hour,
      minute: this.parsePositiveIntStrict(result[2], true) as Minute,
    };
  }
}
