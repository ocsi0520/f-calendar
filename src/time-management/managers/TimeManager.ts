import { Injectable } from '@angular/core';
import { WeekTime } from '../definition/WeekTime';
import { TimeMapper } from '../mappers/TimeMapper';
import { sessionTime, timeGranularityInMins } from '../session';

@Injectable({ providedIn: 'root' })
export class TimeManager {
  constructor(private timeMapper: TimeMapper) {}

  public isAtOrAfter(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.weekTimeToNumber(time) >= this.timeMapper.weekTimeToNumber(base);
  }

  public isAfter(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.weekTimeToNumber(time) > this.timeMapper.weekTimeToNumber(base);
  }

  public isSame(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.weekTimeToNumber(time) === this.timeMapper.weekTimeToNumber(base);
  }

  public shiftByGranularity(time: WeekTime): WeekTime {
    return this.shift(time, timeGranularityInMins);
  }

  public shiftBySessionLength(time: WeekTime): WeekTime {
    return this.shift(time, sessionTime.inMinutes);
  }

  public shift(time: WeekTime, minutes: number): WeekTime {
    const numRepresentation = this.timeMapper.weekTimeToNumber(time) + minutes;
    return this.timeMapper.weekTimeFromNumber(numRepresentation);
  }
}
