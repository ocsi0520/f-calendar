import { Injectable } from '@angular/core';
import { ScheduleSpecification } from './specification/specification';
import { ClientInfo, ScheduleItem, Table } from './Table';

// TODO: test
@Injectable({ providedIn: 'root' })
export class TableStepper {
  public step(table: Table, allSpecifications: ScheduleSpecification[]) {
    if (this.isTableDone(table)) {
      this.startNextVariation(table);
      return;
    }
    const hasReachedEndWithCurrentClient =
      table.currentScheduleItemIndex === table.scheduleItems.length;
    if (hasReachedEndWithCurrentClient) this.moveBack(table);
    else this.moveForward(table, allSpecifications);
  }
  private startNextVariation(table: Table) {
    this.moveBackToPreviousClient(table);
    this.moveBackWithCurrentClient(table);
  }
  private moveForward(table: Table, allSpecifications: ScheduleSpecification[]): void {
    this.registerClientToCurrentCell(table);
    if (this.checkSpecifications(table, allSpecifications)) {
      this.commitLastRegistration(table);
    } else {
      this.revertLastRegistration(table);
    }
  }
  private registerClientToCurrentCell(table: Table) {
    const currentCell = this.getCurrentCell(table);
    const currentClientInfo = this.getCurrentClientInfo(table);
    currentCell.clientIdsInvolved.push(currentClientInfo.client.id);
    currentClientInfo.joinedAt.push(table.currentScheduleItemIndex);
  }
  private commitLastRegistration(table: Table) {
    const currentClientInfo = this.getCurrentClientInfo(table);
    const hasAppointmentForAllSessions =
      currentClientInfo.client.sessionCountsInWeek === currentClientInfo.joinedAt.length;
    if (hasAppointmentForAllSessions) {
      table.currentScheduleItemIndex = 0;
      table.currentClientIndex++;
    } else {
      // TODO: create a ClientStepper and store suitable cells for client there
      table.currentScheduleItemIndex = this.findFirstNextDayCellIndex(table, currentClientInfo);
    }
  }

  private findFirstNextDayCellIndex(table: Table, currentClientInfo: ClientInfo): number {
    const lastCommitedCellIndex = currentClientInfo.joinedAt.at(-1)!;
    const commitedCell = table.scheduleItems[lastCommitedCellIndex];
    for (let i = lastCommitedCellIndex; i < table.scheduleItems.length; i++) {
      if (table.scheduleItems[i].timeInterval.dayNumber > commitedCell.timeInterval.dayNumber)
        return i;
    }
    return table.scheduleItems.length;
  }

  private revertLastRegistration(table: Table) {
    const currentCell = this.getCurrentCell(table);
    const currentClientInfo = this.getCurrentClientInfo(table);
    currentCell.clientIdsInvolved.splice(-1, 1);
    currentClientInfo.joinedAt.splice(-1, 1);
    table.currentScheduleItemIndex++;
  }

  private moveBack(table: Table) {
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

    const lastJoinedCell = table.scheduleItems[lastJoinedCellIndex];
    lastJoinedCell.clientIdsInvolved = lastJoinedCell.clientIdsInvolved.filter(
      (clientId) => clientId !== currentClientInfo.client.id,
    );
    currentClientInfo.joinedAt.splice(-1, 1);
    table.currentScheduleItemIndex = lastJoinedCellIndex + 1;
  }

  private getCurrentClientInfo(table: Table): ClientInfo {
    return table.clientInfos[table.currentClientIndex];
  }

  private getCurrentCell(table: Table): ScheduleItem {
    return table.scheduleItems[table.currentScheduleItemIndex];
  }
  private checkSpecifications(table: Table, allSpecifications: ScheduleSpecification[]): boolean {
    return allSpecifications.every((spec) => spec.check(table));
  }

  // TODO: de-duplicate with ScheduleGenerator
  private isTableDone(table: Table): boolean {
    const lastClientInfo = table.clientInfos.at(-1)!;
    return lastClientInfo.joinedAt.length === lastClientInfo.client.sessionCountsInWeek;
  }
}
