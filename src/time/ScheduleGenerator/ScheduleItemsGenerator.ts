import { inject, Injectable } from '@angular/core';
import { ScheduleItem } from './Table';
import { sessionGranularityInMinutes, sessionSpan } from '../session-span';
import { DayNumber, dayNumbers } from '../TimeInterval/TimeInterval-constants';
import { isSameInterval, TimeInterval } from '../TimeInterval/TimeInterval';
import { TimeIntervalManager } from '../TimeInterval/TimeIntervalManager';

@Injectable({
  providedIn: 'root',
})
export class ScheduleItemsGenerator {
  private timeIntervalManager = inject(TimeIntervalManager);
  public generateAllPossibleScheduleItems(): Array<ScheduleItem> {
    return dayNumbers.map(this.generateAllPossibleScheduleItemsFor.bind(this)).flat(1);
  }

  private generateAllPossibleScheduleItemsFor(dayNumber: DayNumber): Array<ScheduleItem> {
    const result: Array<ScheduleItem> = [];
    let timeInterval: TimeInterval = {
      dayNumber,
      start: [7, 0],
      end: [8, 15],
    };
    const lastInterval: TimeInterval = { dayNumber, start: [19, 45], end: [21, 0] };
    while (!isSameInterval(timeInterval, lastInterval)) {
      result.push({
        clientIdsInvolved: [],
        timeInterval,
      });
      timeInterval = this.timeIntervalManager.shiftInterval(
        timeInterval,
        sessionGranularityInMinutes,
      );
    }
    result.push({
      clientIdsInvolved: [],
      timeInterval: lastInterval,
    });
    return result;
  }
}
