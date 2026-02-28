import { Injectable } from '@angular/core';
import { ScheduleCell } from '../Table';
import { DayNumber, dayNumbers } from '../../TimeInterval/TimeInterval-constants';
import { isSameInterval, TimeInterval } from '../../TimeInterval/TimeInterval';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';

@Injectable({
  providedIn: 'root',
})
export class ScheduleCellsGenerator {
  constructor(private timeIntervalManager: TimeIntervalManager) {}

  public generateAllPossibleScheduleCells(): Array<ScheduleCell> {
    return dayNumbers.map(this.generateAllPossibleScheduleCellsFor.bind(this)).flat(1);
  }

  private generateAllPossibleScheduleCellsFor(dayNumber: DayNumber): Array<ScheduleCell> {
    const result: Array<ScheduleCell> = [];
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
      timeInterval = this.timeIntervalManager.shiftByGranularity(timeInterval);
    }
    result.push({
      clientIdsInvolved: [],
      timeInterval: lastInterval,
    });
    return result;
  }
}
