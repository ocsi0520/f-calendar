import { inject, Injectable } from '@angular/core';
import { ScheduleItem } from './Table';
import { TimeManager } from '../TimeManager';
import { sessionGranularityInMinutes, sessionSpan } from '../session-span';
import { DayNumber, dayNumbers } from '../TimeInterval/TimeInterval-constants';
import { TimeInterval } from '../TimeInterval/TimeInterval';

@Injectable({
  providedIn: 'root',
})
export class ScheduleItemsGenerator {
  private timeMapper = inject(TimeManager);
  public generateAllPossibleScheduleItems(): Array<ScheduleItem> {
    return dayNumbers.map(this.generateAllPossibleScheduleItemsFor.bind(this)).flat(1);
  }

  // TODO: use TimeIntervalManager
  private generateAllPossibleScheduleItemsFor(dayNumber: DayNumber): Array<ScheduleItem> {
    const result: Array<ScheduleItem> = [];
    let startTime = this.timeMapper.timeToNumber([7, 0]);
    let endTime = startTime + sessionSpan.inMinutes;
    while (endTime <= this.timeMapper.timeToNumber([21, 0])) {
      const timeInterval: TimeInterval = {
        dayNumber,
        start: this.timeMapper.numberToTime(startTime),
        end: this.timeMapper.numberToTime(endTime),
      };
      result.push({
        clientIdsInvolved: [],
        timeInterval,
      });
      startTime += sessionGranularityInMinutes;
      endTime += sessionGranularityInMinutes;
    }
    return result;
  }
}
