import { Injectable } from '@angular/core';
import { ClientInfo, Table, TableCell } from '../Table';
import { SpecificationManager } from '../specification/SpecificationManager';
import { TableUtils } from './TableUtils';
import { TableStepper } from './TableStepper';

@Injectable({ providedIn: 'root' })
export class TableManager {
  constructor(
    private specManager: SpecificationManager,
    private tableUtils: TableUtils,
    private tableStepper: TableStepper,
  ) {}

  public isFinished(table: Table): boolean {
    return table.clientPart.currentClientIndex >= table.clientPart.clients.length;
  }

  public isImpossible(table: Table): boolean {
    return table.clientPart.currentClientIndex < 0;
  }

  public step(table: Table): void {
    const currentClientInfo = this.tableUtils.getCurrentClientInfo(table);
    const currentCellIndex = this.tableUtils.getCurrentCellIndex(table);
    const currentCell = this.tableUtils.getCurrentCell(table, currentCellIndex);

    this.registerCurrent(currentClientInfo, currentCell);
    const result = this.specManager.checkSpecifications(table, currentCellIndex);
    if (!result.passed) this.unregisterCurrent(currentClientInfo, currentCell);
    this.tableStepper.step(table, result);
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
