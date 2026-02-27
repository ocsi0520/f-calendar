import { Result, ScheduleSpecification } from './specification';
import { ScheduleItem, Table } from '../Table';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { sessionGranularityInMinutes } from '../../session-span';

type FailResult = Result & { passed: false };

export class SpecificationManager {
  /**
   *
   * @param timeIntervalManager simple interval manager
   * @param allSpecifications specifications to be followed. !! ORDER DOES MATTER !!
   *  Spec checks (in case of violation) return the first possible interval as a hint.
   *  The hint coming from the first failed spec check is returned in `checkSpecifications` method
   */
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly allSpecifications: Array<ScheduleSpecification>,
  ) {}

  public checkSpecifications(table: Table): Result {
    const failedResult = this.getFirstFailedResult(table);
    return failedResult || { passed: true };
  }

  private getCurrentCell(table: Table): ScheduleItem {
    return table.scheduleItems[table.currentScheduleItemIndex];
  }

  // TODO: this could be cached in a simple array i.e. at construction or for the first time
  private getCellsWithSameDay(table: Table, currentCell: ScheduleItem): Array<ScheduleItem> {
    return table.scheduleItems.filter(
      (cell) => cell.timeInterval.dayNumber === currentCell.timeInterval.dayNumber,
    );
  }

  private getFirstFailedResult(table: Table): FailResult | null {
    // from table, we can get the current cell, day and whole week later
    const currentCell = this.getCurrentCell(table);
    const cellsOnSameDay = this.getCellsWithSameDay(table, currentCell);

    for (let spec of this.allSpecifications) {
      const result = this.getResult(spec.check(table, cellsOnSameDay, currentCell), currentCell);
      if (!result.passed) return result;
    }

    return null;
  }

  // TODO: later on delete this one
  private getResult(
    result: Result | boolean,
    { timeInterval: currentInterval }: ScheduleItem,
  ): Result {
    if (typeof result !== 'boolean') return result;

    if (result) return { passed: true };

    const shiftedByGranularity = this.timeIntervalManager.shiftInterval(
      currentInterval,
      sessionGranularityInMinutes,
    );
    return { passed: false, nextTryHint: { firstValidInterval: shiftedByGranularity } };
  }
}
