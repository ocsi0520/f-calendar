import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { Table, TableCell } from '../../Table';
import { ScheduleSpecification, NextValidStartResult } from '../specification';
import { sessionTime, timeGranularityInMins } from '../../../session';

// in case of: prevOverlappingCell - currentCell
// since we already passed prevOverlappingCell, we can't have pair with it
// so we should jump to the end of prevOverlappingCell
// HOWEVER, if currentCell - followingOverlappingCell
// we might have a pair (check ProperPairsSpecification) with it, so first
// we have to jump to that specific followingOverlappingCell, then ProperPairsSpecification
// can jump to its end in case of no proper pair
export class NoOverlappingSessionsSpecification implements ScheduleSpecification {
  constructor(private readonly sameDayIntervalManager: SameDayIntervalManager) {}

  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const dayNumber = currentCell.timeInterval.dayNumber;
    const sameDayCells = table.cellPart.views.byDay[dayNumber];

    const [firstIndexToCheck, lastIndexToCheck] = this.getMeaningfulIndexes(
      sameDayCells,
      currentCell,
    );
    let isExaminedAfterCurrent = false;
    for (let i = firstIndexToCheck; i <= lastIndexToCheck; i++) {
      const cellToCheck = sameDayCells[i];
      if (cellToCheck.clientIdsInvolved.length === 0) continue;
      if (cellToCheck === currentCell) {
        isExaminedAfterCurrent = true;
        continue;
      }

      if (
        this.sameDayIntervalManager.areIntervalsOverlapping(
          currentCell.timeInterval,
          cellToCheck.timeInterval,
        )
      ) {
        const whichEnd = isExaminedAfterCurrent
          ? cellToCheck.timeInterval.start
          : cellToCheck.timeInterval.end;
        return {
          dayNumber: cellToCheck.timeInterval.dayNumber,
          hour: whichEnd.hour,
          minute: whichEnd.minute,
        };
      }
    }
    return null;
  }

  private getMeaningfulIndexes(
    sameDayCells: Array<TableCell>,
    currentCell: TableCell,
  ): [firstIndexToCheck: number, lastIndexToCheck: number] {
    const indexOfCurrentCell = sameDayCells.indexOf(currentCell);
    // basically 5, so in case I've index 7, 2 and 12 must be out of range
    // but 3 and 11 can still be in range --> maxInvalidDiff=4
    const granularityDiffBetweenValidSessions = sessionTime.inMinutes / timeGranularityInMins;
    const maxInvalidDiff = granularityDiffBetweenValidSessions - 1;
    const firstIndexToCheck = Math.max(0, indexOfCurrentCell - maxInvalidDiff);
    const lastIndexToCheck = Math.min(sameDayCells.length - 1, indexOfCurrentCell + maxInvalidDiff);
    return [firstIndexToCheck, lastIndexToCheck];
  }
}
