import { Injectable } from '@angular/core';
import { WeekTime } from '../definition/WeekTime';
import { TimeMapper } from '../mappers/TimeMapper';

@Injectable({ providedIn: 'root' })
export class TimeManager {
  constructor(private timeMapper: TimeMapper) {}

  public isAtOrAfter(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.toNumber(time) >= this.timeMapper.toNumber(base);
  }

  public isAfter(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.toNumber(time) > this.timeMapper.toNumber(base);
  }

  public isSame(time: WeekTime, base: WeekTime): boolean {
    return this.timeMapper.toNumber(time) === this.timeMapper.toNumber(base);
  }
}
