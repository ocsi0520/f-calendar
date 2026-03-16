import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { Table } from '../../Table';
import { ScheduleSpecification, NextValidStartResult } from '../specification';
import { TableUtils } from '../../TableManager/TableUtils';
import { sessionTime, timeGranularityInMins } from '../../../session';

// in case of: prevOverlappingCell - currentCell
// since we already passed prevOverlappingCell, we can't have pair with it
// so we should jump to the end of prevOverlappingCell
// HOWEVER, if currentCell - followingOverlappingCell
// we might have a pair (check ProperPairsSpecification) with it, so first
// we have to jump to that specific followingOverlappingCell, then ProperPairsSpecification
// can jump to its end in case of no proper pair
export class NoOverlappingSessionsSpecification implements ScheduleSpecification {
  constructor(
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly tableUtils: TableUtils,
  ) {}

  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const [firstIndexToCheck, lastIndexToCheck] = this.getMeaningfulIndexes(
      table,
      currentCellLinearIndex,
    );
    return (
      this.getNextValidStartDueToOverlapWithPreceedingCell(
        table,
        currentCellLinearIndex,
        firstIndexToCheck,
      ) ||
      this.getNextValidStartDueToOverlapWithFollowingCell(
        table,
        currentCellLinearIndex,
        lastIndexToCheck,
      )
    );
  }
  private getNextValidStartDueToOverlapWithPreceedingCell(
    table: Table,
    currentCellLinearIndex: number,
    firstIndexToCheck: number,
  ): NextValidStartResult {
    const currentCell = this.tableUtils.getCurrentCell(table, currentCellLinearIndex);
    for (let i = firstIndexToCheck; i < currentCellLinearIndex; i++) {
      const cellToCheck = this.tableUtils.getCurrentCell(table, i);
      if (
        cellToCheck.clientIdsInvolved.length &&
        this.sameDayIntervalManager.areIntervalsOverlapping(
          currentCell.timeInterval,
          cellToCheck.timeInterval,
        )
      ) {
        return {
          dayNumber: cellToCheck.timeInterval.dayNumber,
          hour: cellToCheck.timeInterval.end.hour,
          minute: cellToCheck.timeInterval.end.minute,
        };
      }
    }
    return null;
  }

  private getNextValidStartDueToOverlapWithFollowingCell(
    table: Table,
    currentCellLinearIndex: number,
    lastIndexToCheck: number,
  ): NextValidStartResult {
    const currentCell = this.tableUtils.getCurrentCell(table, currentCellLinearIndex);
    for (let i = currentCellLinearIndex + 1; i <= lastIndexToCheck; i++) {
      const cellToCheck = this.tableUtils.getCurrentCell(table, i);
      if (
        cellToCheck.clientIdsInvolved.length &&
        this.sameDayIntervalManager.areIntervalsOverlapping(
          currentCell.timeInterval,
          cellToCheck.timeInterval,
        )
      ) {
        return {
          dayNumber: cellToCheck.timeInterval.dayNumber,
          hour: cellToCheck.timeInterval.start.hour,
          minute: cellToCheck.timeInterval.start.minute,
        };
      }
    }
    return null;
  }

  private getMeaningfulIndexes(
    table: Table,
    currentCellLinearIndex: number,
  ): [firstIndexToCheck: number, lastIndexToCheck: number] {
    // basically 5, so in case I've index 7, 2 and 12 must be out of range
    // but 3 and 11 can still be in range --> maxInvalidDiff=4
    const granularityDiffBetweenValidSessions = sessionTime.inMinutes / timeGranularityInMins;
    const maxInvalidDiff = granularityDiffBetweenValidSessions - 1;
    const firstIndexToCheck = Math.max(0, currentCellLinearIndex - maxInvalidDiff);
    const lastIndexToCheck = Math.min(
      table.cellPart.views.linear.length - 1,
      currentCellLinearIndex + maxInvalidDiff,
    );
    return [firstIndexToCheck, lastIndexToCheck];
  }
}
