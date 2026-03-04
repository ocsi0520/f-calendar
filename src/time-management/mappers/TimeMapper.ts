import { Injectable } from '@angular/core';
import { WeekTime } from '../definition/WeekTime';
import { DayNumber, Hour, Minute } from '../definition/time-components';
import { DayTime } from '../definition/TimeInterval';

const MAX_NUM_REPRESENTATION = 7 * 24 * 60 - 1;
const TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;

@Injectable({ providedIn: 'root' })
export class TimeMapper {
  public weekTimeToNumber({ dayNumber, hour, minute }: WeekTime): number {
    const passedDays = dayNumber - 1;
    return (passedDays * 24 + hour) * 60 + minute;
  }

  public weekTimeFromNumber(minutesFromMondayMidnight: number): WeekTime {
    if (minutesFromMondayMidnight < 0 || minutesFromMondayMidnight > MAX_NUM_REPRESENTATION)
      throw new RangeError('invalid num representation for WeekTime');
    const MINUTES_IN_DAY = 24 * 60;

    const dayNumber = Math.floor(minutesFromMondayMidnight / MINUTES_IN_DAY) + 1;
    const minutesIntoDay = minutesFromMondayMidnight % MINUTES_IN_DAY;

    const hour = Math.floor(minutesIntoDay / 60);
    const minute = minutesIntoDay % 60;

    return {
      dayNumber: dayNumber as DayNumber,
      hour: hour as Hour,
      minute: minute as Minute,
    };
  }

  public dayTimeToNumber({ hour, minute }: DayTime): number {
    return hour * 60 + minute;
  }

  public dayTimeFromNumber(representation: number): DayTime {
    if (Number.isNaN(representation)) throw new RangeError('NaN is forbidden');
    if (representation < 0 || representation >= 24 * 60)
      throw new RangeError('invalid num represetntation for DayTime');
    return {
      hour: Math.floor(representation / 60) as Hour,
      minute: (representation % 60) as Minute,
    };
  }

  public dayTimeFromString(timeString: string): DayTime {
    const result = timeString.match(TIME_REGEX);
    if (result?.length !== 3) throw new Error('Invalid time string: ' + timeString);

    return {
      hour: this.parsePositiveIntStrict(result[1], true) as Hour,
      minute: this.parsePositiveIntStrict(result[2], true) as Minute,
    };
  }

  public dayTimeToString({ hour, minute }: DayTime): string {
    return this.withLeading0(hour) + ':' + this.withLeading0(minute);
  }

  private withLeading0(number: Number): string {
    return number.toString(10).padStart(2, '0');
  }

  private parsePositiveIntStrict(value: string, allowLeading0 = false): number {
    const valueToCheck = allowLeading0 && value.startsWith('0') ? value.slice(1) : value;

    if (!/^\d+$/.test(valueToCheck)) {
      throw new Error(`Invalid integer: "${valueToCheck}"`);
    }

    return Number(valueToCheck);
  }

  public dayNumberFromString(dayTimeString: string): DayNumber {
    return this.validateNumberOfDay(this.parsePositiveIntStrict(dayTimeString));
  }

  private validateNumberOfDay(rawDayNumber: number): DayNumber {
    if (rawDayNumber < 1 || rawDayNumber > 7) throw new Error('Invalid DayNumber: ' + rawDayNumber);
    return rawDayNumber as DayNumber;
  }
}
