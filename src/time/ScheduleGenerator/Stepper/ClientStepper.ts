import { Injectable } from '@angular/core';
import { ClientInfo, Table } from '../Table';
import { FailResult, Result } from '../specification/specification';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';

// TODO: later on integrate client's possible cells instead of all possible cells in table
@Injectable({ providedIn: 'root' })
export class ClientStepper {
  constructor(private timeIntervalManager: TimeIntervalManager) {}

  public hasReachedEndWithClient(table: Table): boolean {
    return table.currentScheduleCellIndex >= table.scheduleCells.length;
  }

  // only when client is registered succesfully or revoked last registration
  // but anyway it's not about going backward
  public stepForward(table: Table, checkResult: Result): void {
    const currentClientInfo = this.getCurrentClientInfo(table);
    const hasAppointmentForAllSessions =
      currentClientInfo.client.sessionCountsInWeek === currentClientInfo.joinedAt.length;
    if (hasAppointmentForAllSessions) {
      this.switchToNextClient(table);
    } else {
      this.stepWithCurrentClient(table, currentClientInfo, checkResult);
    }
  }

  public stepBack(table: Table) {
    const clientHasPreviouslyJoinedSession = this.getCurrentClientInfo(table).joinedAt.length > 0;
    if (clientHasPreviouslyJoinedSession) {
      this.moveBackWithCurrentClient(table);
    } else {
      this.moveBackToPreviousClient(table);
      const hasPreviousClient = table.currentClientIndex >= 0;
      // previous client if exists must be filled
      if (hasPreviousClient) this.moveBackWithCurrentClient(table);
      // otherwise can throw error or consumer can handle on the state of the table
    }
  }

  private moveBackToPreviousClient(table: Table): void {
    table.currentClientIndex--;
  }

  private moveBackWithCurrentClient(table: Table): void {
    const currentClientInfo = this.getCurrentClientInfo(table);
    const lastJoinedCellIndex = currentClientInfo.joinedAt.at(-1)!;

    const lastJoinedCell = table.scheduleCells[lastJoinedCellIndex];
    lastJoinedCell.clientIdsInvolved = lastJoinedCell.clientIdsInvolved.filter(
      (clientId) => clientId !== currentClientInfo.client.id,
    );

    currentClientInfo.joinedAt.splice(-1, 1);
    table.currentScheduleCellIndex = lastJoinedCellIndex + 1;
  }

  private stepWithCurrentClient(
    table: Table,
    currentClientInfo: ClientInfo,
    checkResult: Result,
  ): void {
    table.currentScheduleCellIndex = this.findNextCellIndexForClient(
      table,
      currentClientInfo,
      checkResult,
    );
  }

  private switchToNextClient(table: Table): void {
    table.currentScheduleCellIndex = 0;
    table.currentClientIndex++;
  }

  private findNextCellIndexForClient(
    table: Table,
    currentClientInfo: ClientInfo,
    checkResult: Result,
  ): number {
    if (checkResult.passed) {
      return this.getFirstIndexOfCellOnNextDay(table, currentClientInfo);
    } else {
      return this.getFirstIndexWhichSatisfiesHint(table, currentClientInfo, checkResult);
    }
  }

  private getFirstIndexOfCellOnNextDay(table: Table, currentClientInfo: ClientInfo): number {
    const lastCommitedCellIndex = currentClientInfo.joinedAt.at(-1)!;
    const dayNumberOflastCommitedCell =
      table.scheduleCells[lastCommitedCellIndex].timeInterval.dayNumber;

    for (let i = lastCommitedCellIndex + 1; i < table.scheduleCells.length; i++) {
      if (table.scheduleCells[i].timeInterval.dayNumber > dayNumberOflastCommitedCell) return i;
    }
    return table.scheduleCells.length;
  }

  private getFirstIndexWhichSatisfiesHint(
    table: Table,
    _currentClientInfo: ClientInfo,
    checkResult: FailResult,
  ): number {
    const hintInterval = checkResult.nextTryHint.firstValidInterval;

    for (let i = table.currentScheduleCellIndex; i < table.scheduleCells.length; i++) {
      const cell = table.scheduleCells[i];
      if (this.timeIntervalManager.isIntervalAtOrAfterBase(cell.timeInterval, hintInterval))
        return i;
    }
    return table.scheduleCells.length;
  }

  private getCurrentClientInfo(table: Table): ClientInfo {
    return table.clientInfos[table.currentClientIndex];
  }
}
