import { Result, ScheduleSpecification } from './specification';
import { ScheduleItem, Table } from '../Table';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { sessionGranularityInMinutes } from '../../session-span';

export class SpecificationManager {
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly allSpecifications: Array<ScheduleSpecification>,
  ) {}

  public checkSpecifications(table: Table): Result {
    // from table, we can get the current cell, day and whole week later
    const currentCell = this.getCurrentCell(table);
    const cellsOnSameDay = this.getCellsWithSameDay(table, currentCell);
    const hasPassed = this.allSpecifications.every((spec) =>
      this.evaluateResult(spec.check(table, cellsOnSameDay, currentCell)),
    );
    if (hasPassed) return { passed: true };
    else {
      const currentInterval = table.scheduleItems[table.currentScheduleItemIndex].timeInterval;
      // TODO: ScheduleSpecification should return Result, and pick the furthest time from it
      const shiftedByGranularity = this.timeIntervalManager.shiftInterval(
        currentInterval,
        sessionGranularityInMinutes,
      );
      return { passed: false, nextTryHint: { firstValidInterval: shiftedByGranularity } };
    }
  }

  private getCurrentCell(table: Table): ScheduleItem {
    return table.scheduleItems[table.currentScheduleItemIndex];
  }

  private getCellsWithSameDay(table: Table, currentCell: ScheduleItem): Array<ScheduleItem> {
    return table.scheduleItems.filter(
      (cell) => cell.timeInterval.dayNumber === currentCell.timeInterval.dayNumber,
    );
  }

  private evaluateResult(result: Result | boolean): boolean {
    if (typeof result === 'boolean') return result;
    return result.passed;
  }
}
