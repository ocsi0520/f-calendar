import { Injectable } from '@angular/core';
import { DayNumber } from '../../../definition/time-components';
import { makeSameDayInterval, SameDayInterval } from '../../../definition/TimeInterval';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';

@Injectable({
  providedIn: 'root',
})
export class CellIntervalsGenerator {
  constructor(private SameDayIntervalManager: SameDayIntervalManager) {}

  public generateAllPossibleScheduleCells(): Array<SameDayInterval> {
    const dayNumbers = [1, 2, 3, 4, 5, 6, 7] as const;
    return dayNumbers.map(this.generateAllPossibleScheduleCellsFor.bind(this)).flat(1);
  }

  private generateAllPossibleScheduleCellsFor(dayNumber: DayNumber): Array<SameDayInterval> {
    const result: Array<SameDayInterval> = [];
    let SameDayInterval: SameDayInterval = makeSameDayInterval(dayNumber, [7, 0], [8, 15]);
    const lastInterval: SameDayInterval = makeSameDayInterval(dayNumber, [19, 45], [21, 0]);
    while (!this.SameDayIntervalManager.isSameInterval(SameDayInterval, lastInterval)) {
      result.push(SameDayInterval);
      SameDayInterval = this.SameDayIntervalManager.shiftByGranularity(SameDayInterval);
    }
    result.push(SameDayInterval);
    return result;
  }
}
