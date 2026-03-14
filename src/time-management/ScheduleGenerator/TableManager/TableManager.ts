import { Injectable } from '@angular/core';
import { ClientInfo, Table, TableCell } from '../Table';
import { SpecificationManager } from '../specification/SpecificationManager';
import { TableUtils } from './TableUtils';
import { TableStepper } from './TableStepper';
import { hasCheckPassed } from '../specification/specification';

// TODO: next variation

@Injectable({ providedIn: 'root' })
export class TableManager {
  constructor(
    private tableUtils: TableUtils,
    private tableStepper: TableStepper,
  ) {}

  private maxClientIndex = 0;

  public getMaxClientIndex(): number {
    return this.maxClientIndex;
  }

  public isFinished(table: Table): boolean {
    return table.clientPart.currentClientIndex >= table.clientPart.clients.length;
  }

  public isImpossible(table: Table): boolean {
    return table.clientPart.currentClientIndex < 0;
  }

  public step(table: Table, specManager: SpecificationManager): void {
    this.maxClientIndex = Math.max(this.maxClientIndex, table.clientPart.currentClientIndex);
    const currentClientInfo = this.tableUtils.getCurrentClientInfo(table);
    const currentCellIndex = this.tableUtils.getCurrentCellIndex(table);
    const currentCell = this.tableUtils.getCurrentCell(table, currentCellIndex);

    this.registerCurrent(currentClientInfo, currentCell);
    const nextValidStart = specManager.checkSpecifications(table, currentCellIndex);
    if (!hasCheckPassed(nextValidStart)) this.unregisterCurrent(currentClientInfo, currentCell);
    this.tableStepper.step(table, nextValidStart);
  }
  private unregisterCurrent(currentClientInfo: ClientInfo, currentCell: TableCell) {
    currentClientInfo.joinedAt.pop();
    currentCell.clientIdsInvolved.pop();
  }
  private registerCurrent(currentClientInfo: ClientInfo, currentCell: TableCell) {
    currentClientInfo.joinedAt.push(currentClientInfo.currentIndexOfPossibleCells);
    currentCell.clientIdsInvolved.push(currentClientInfo.client.id);
  }
}
