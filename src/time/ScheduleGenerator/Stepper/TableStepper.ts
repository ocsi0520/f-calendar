import { Injectable } from '@angular/core';
import { ClientInfo, ScheduleCell, Table } from '../Table';
import { SpecificationManager } from '../specification/SpecificationManager';
import { ClientStepper } from './ClientStepper';

// TODO: test
@Injectable({ providedIn: 'root' })
export class TableStepper {
  constructor(private readonly clientStepper: ClientStepper) {}

  public step(table: Table, specManager: SpecificationManager) {
    const hasReachedEndWithCurrentClient = this.clientStepper.hasReachedEndWithClient(table);
    if (hasReachedEndWithCurrentClient) this.clientStepper.stepBack(table);
    else this.moveForward(table, specManager);
  }

  public startNextVariation(table: Table) {
    table.currentClientIndex--;
    this.clientStepper.stepBack(table);
  }

  private moveForward(table: Table, specManager: SpecificationManager): void {
    const currentCell = table.scheduleCells[table.currentScheduleCellIndex];
    const currentClientInfo = table.clientInfos[table.currentClientIndex];

    this.registerClientToCurrentCell(table, currentClientInfo, currentCell);
    const checkResult = specManager.checkSpecifications(table);
    if (!checkResult.passed) this.revertLastRegistration(currentClientInfo, currentCell);
    this.clientStepper.stepForward(table, checkResult);
  }

  private registerClientToCurrentCell(
    table: Table,
    currentClientInfo: ClientInfo,
    currentCell: ScheduleCell,
  ) {
    currentCell.clientIdsInvolved.push(currentClientInfo.client.id);
    currentClientInfo.joinedAt.push(table.currentScheduleCellIndex);
  }

  private revertLastRegistration(currentClientInfo: ClientInfo, currentCell: ScheduleCell) {
    currentCell.clientIdsInvolved.splice(-1, 1);
    currentClientInfo.joinedAt.splice(-1, 1);
  }
}
