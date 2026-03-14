import { Injectable } from '@angular/core';
import { hasCheckPassed, SpecCheckResult } from '../specification/specification';
import { ClientInfo, Table, TableCell } from '../Table';
import { TableUtils } from './TableUtils';
import { TimeMapper } from '../../mappers/TimeMapper';

type CellCriteria = (cell: TableCell) => boolean;

// PC = possible cell

@Injectable({ providedIn: 'root' })
export class TableStepper {
  constructor(
    private tableUtils: TableUtils,
    private timeMapper: TimeMapper,
  ) {}

  public step(table: Table, result: SpecCheckResult): void {
    const currentClientInfo = this.tableUtils.getCurrentClientInfo(table);

    const hasReachedAllSessions =
      currentClientInfo.joinedAt.length === currentClientInfo.client.sessionCountsInWeek;
    if (hasReachedAllSessions) {
      table.clientPart.currentClientIndex++;
      return;
    }

    this.stepNonFinishedClient(table, currentClientInfo, result);
  }

  private stepNonFinishedClient(
    table: Table,
    currentClientInfo: ClientInfo,
    result: SpecCheckResult,
  ): void {
    const nextPossibleCellIndex = this.getNextPossibleCellIndexWithCriteria(
      table,
      currentClientInfo,
      this.getCriteria(table, currentClientInfo, result),
    );
    if (nextPossibleCellIndex === -1) this.stepBackWithClient(table, currentClientInfo);
    else currentClientInfo.currentIndexOfPossibleCells = nextPossibleCellIndex;
  }

  private getCriteria(
    table: Table,
    currentClientInfo: ClientInfo,
    result: SpecCheckResult,
  ): CellCriteria {
    if (hasCheckPassed(result)) {
      const currentDayNumber = this.tableUtils.getCurrentCell(table, currentClientInfo).timeInterval
        .dayNumber;
      return (cell: TableCell) => cell.timeInterval.dayNumber > currentDayNumber;
    } else {
      return (cell) =>
        this.timeMapper.weekTimeToNumber({
          dayNumber: cell.timeInterval.dayNumber,
          hour: cell.timeInterval.start.hour,
          minute: cell.timeInterval.start.minute,
        }) >= result;
    }
  }

  private stepBackWithClient(table: Table, currentClientInfo: ClientInfo): void {
    const lastJoinedPCIndex = currentClientInfo.joinedAt.pop();
    if (typeof lastJoinedPCIndex !== 'undefined') {
      this.stepBackWithClientHavingSession(table, currentClientInfo, lastJoinedPCIndex);
    } else {
      this.switchBackToPreviousClient(table, currentClientInfo);
    }
  }

  private stepBackWithClientHavingSession(
    table: Table,
    currentClientInfo: ClientInfo,
    lastJoinedPCIndex: number,
  ): void {
    const lastOccupiedCellByClient = this.tableUtils.getCellAt(
      table,
      currentClientInfo,
      lastJoinedPCIndex,
    );
    lastOccupiedCellByClient.clientIdsInvolved = lastOccupiedCellByClient.clientIdsInvolved.filter(
      (cId) => cId !== currentClientInfo.client.id,
    );
    currentClientInfo.currentIndexOfPossibleCells = lastJoinedPCIndex + 1;
    if (
      currentClientInfo.currentIndexOfPossibleCells >= currentClientInfo.possibleCellIndexes.length
    )
      this.stepBackWithClient(table, currentClientInfo);
  }

  private switchBackToPreviousClient(table: Table, currentClientInfo: ClientInfo): void {
    currentClientInfo.currentIndexOfPossibleCells = 0;
    // this.myAssert(table, currentClientInfo);
    table.clientPart.currentClientIndex--;
    if (table.clientPart.currentClientIndex > -1)
      // otherwise handled in ScheduleGenerator
      this.stepBackWithClient(table, this.tableUtils.getCurrentClientInfo(table));
  }

  private myAssert(table: Table, currentClientInfo: ClientInfo): void {
    if (currentClientInfo.joinedAt.length) throw new Error('assert1');
    const hasAnyCellWithThisClient = table.cellPart.views.linear.some((cell) =>
      cell.clientIdsInvolved.includes(currentClientInfo.client.id),
    );
    if (hasAnyCellWithThisClient) throw new Error('assert2');
  }

  private getNextPossibleCellIndexWithCriteria(
    table: Table,
    currentClientInfo: ClientInfo,
    criteria: (cell: TableCell) => boolean,
  ): number {
    for (
      let i = currentClientInfo.currentIndexOfPossibleCells + 1;
      i < currentClientInfo.possibleCellIndexes.length;
      i++
    ) {
      const cell = this.tableUtils.getCellAt(table, currentClientInfo, i);
      if (criteria(cell)) return i;
    }
    return -1;
  }
}
