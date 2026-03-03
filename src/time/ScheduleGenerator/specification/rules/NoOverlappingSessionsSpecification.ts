import { sessionGranularityInMinutes, sessionSpan } from '../../../session-span';
import { TimeInterval } from '../../../TimeInterval/TimeInterval';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleCell, Table } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export class NoOverlappingSessionsSpecification implements ScheduleSpecification {
  constructor(private readonly timeIntervalManager: TimeIntervalManager) {}

  public check(
    _table: Table,
    sameDayCells: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): Result {
    const [firstIndexToCheck, lastIndexToCheck] = this.getMeaningfulIndexes(
      sameDayCells,
      currentCell,
    );
    for (let i = firstIndexToCheck; i <= lastIndexToCheck; i++) {
      const cellToCheck = sameDayCells[i];
      if (this.isSameOrNonOccupied(currentCell, cellToCheck)) continue;

      if (
        this.timeIntervalManager.areIntervalsOverlapping(
          currentCell.timeInterval,
          cellToCheck.timeInterval,
        )
      )
        return {
          passed: false,
          nextTryHint: { firstValidInterval: this.getFirstValidInterval(currentCell, cellToCheck) },
          name: NoOverlappingSessionsSpecification.name,
        };
    }
    return { passed: true };
  }
  private getFirstValidInterval(
    currentCell: ScheduleCell,
    cellToCheck: ScheduleCell,
  ): TimeInterval {
    const currentCellIsAfter = this.timeIntervalManager.isIntervalAtOrAfterBase(
      currentCell.timeInterval,
      cellToCheck.timeInterval,
    );
    // TODO: absolute mind-blowing question, WHY?!?!
    // WHY NOT SIMPLY this.getFirstTimeIntervalRightAfter(cellToCheck); ????
    // moreover even if this.timeIntervalManager.shiftByGranularity(cellToCheck.timeInterval)
    // it still changes
    if (!currentCellIsAfter)
      return cellToCheck.timeInterval;
      // return this.timeIntervalManager.shiftByGranularity(cellToCheck.timeInterval);

    return this.getFirstTimeIntervalRightAfter(cellToCheck);
  }

  private isSameOrNonOccupied(currentCell: ScheduleCell, cellToExamine: ScheduleCell): boolean {
    return currentCell === cellToExamine || cellToExamine.clientIdsInvolved.length === 0;
  }

  private getMeaningfulIndexes(
    sameDayCells: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): [firstIndexToCheck: number, lastIndexToCheck: number] {
    const indexOfCurrentCell = sameDayCells.indexOf(currentCell);
    // basically 5, so in case I've index 7, 2 and 12 must be out of range
    // but 3 and 11 can still be in range --> maxInvalidDiff=4
    const granularityDiffBetweenValidSessions = sessionSpan.inMinutes / sessionGranularityInMinutes;
    const maxInvalidDiff = granularityDiffBetweenValidSessions - 1;
    const firstIndexToCheck = Math.max(0, indexOfCurrentCell - maxInvalidDiff);
    const lastIndexToCheck = Math.min(sameDayCells.length - 1, indexOfCurrentCell + maxInvalidDiff);
    return [firstIndexToCheck, lastIndexToCheck];
  }
  private getFirstTimeIntervalRightAfter(cell: ScheduleCell): TimeInterval {
    return this.timeIntervalManager.shiftBySessionLength(cell.timeInterval);
  }
}
