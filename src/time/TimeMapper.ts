import { Injectable } from '@angular/core';
import { Hour, Minute, Time } from './Time';

@Injectable({
  providedIn: 'root',
})
export class TimeMapper {
  public timeToNumber([hour, minute]: Time): number {
    return hour * 60 + minute;
  }

  public numberToTime(representation: number): Time {
    if (representation < 0 || representation >= 24 * 60)
      throw new Error('invalid time representation');
    return [Math.floor(representation / 60) as Hour, (representation % 60) as Minute];
  }
}
