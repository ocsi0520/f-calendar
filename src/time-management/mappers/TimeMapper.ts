import { Injectable } from '@angular/core';
import { WeekTime } from '../definition/WeekTime';
import { DayNumber, Hour, Minute } from '../definition/time-components';
import { DayTime } from '../definition/TimeInterval';

const MAX_NUM_REPRESENTATION = 7 * 24 * 60 - 1;
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
    if (representation < 0 || representation >= 24 * 60)
      throw new RangeError('invalid num represetntation for DayTime');
    return {
      hour: Math.floor(representation / 60) as Hour,
      minute: (representation % 60) as Minute,
    };
  }
}
