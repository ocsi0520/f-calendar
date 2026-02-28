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
          nextTryHint: { firstValidInterval: this.getFirstTimeIntervalRightAfter(cellToCheck) },
        };
    }
    return { passed: true };
  }

  private isSameOrNonOccupied(currentCell: ScheduleCell, cellToExamine: ScheduleCell): boolean {
    return currentCell === cellToExamine || cellToExamine.clientIdsInvolved.length === 0;
  }

  private getMeaningfulIndexes(
    sameDayCells: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): [firstIndexToCheck: number, lastIndexToCheck: number] {
    const indexOfCurrentCell = sameDayCells.indexOf(currentCell);
    // basically 5
    const shiftBetweenValidSessionsInGranularity =
      sessionSpan.inMinutes / sessionGranularityInMinutes;
    const firstIndexToCheck = Math.max(
      0,
      indexOfCurrentCell - shiftBetweenValidSessionsInGranularity,
    );
    const lastIndexToCheck = Math.min(
      sameDayCells.length - 1,
      indexOfCurrentCell + shiftBetweenValidSessionsInGranularity,
    );
    return [firstIndexToCheck, lastIndexToCheck];
  }
  private getFirstTimeIntervalRightAfter(cell: ScheduleCell): TimeInterval {
    return this.timeIntervalManager.shiftBySessionLength(cell.timeInterval);
  }
}
