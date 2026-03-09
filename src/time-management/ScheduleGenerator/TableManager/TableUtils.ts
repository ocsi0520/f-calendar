import { Injectable } from '@angular/core';
import { ClientInfo, Table, TableCell } from '../Table';

@Injectable({ providedIn: 'root' })
export class TableUtils {
  public getCurrentCellIndex(table: Table, cachedClientInfo?: ClientInfo): number {
    const currentClientInfo = cachedClientInfo ?? this.getCurrentClientInfo(table);
    const currentPossibleCellindex = currentClientInfo.currentIndexOfPossibleCells;
    const tableIndex = currentClientInfo.possibleCellIndexes[currentPossibleCellindex];
    return tableIndex;
  }

  public getCurrentClientInfo(table: Table): ClientInfo {
    const currentClientIndex = table.clientPart.currentClientIndex;
    return table.clientPart.clients[currentClientIndex];
  }

  public getCurrentCell(table: Table): TableCell;
  public getCurrentCell(table: Table, cachedClientInfo: ClientInfo): TableCell;
  public getCurrentCell(table: Table, currentIndex: number): TableCell;
  public getCurrentCell(table: Table, additionalInfo?: ClientInfo | number): TableCell {
    if (typeof additionalInfo === 'number') return table.cellPart.views.linear[additionalInfo];

    const currentClientInfo = additionalInfo ?? this.getCurrentClientInfo(table);
    const currentPossibleCellindex = currentClientInfo.currentIndexOfPossibleCells;
    const tableIndex = currentClientInfo.possibleCellIndexes[currentPossibleCellindex];
    return table.cellPart.views.linear[tableIndex];
  }

  public getCellAt(table: Table, clientInfo: ClientInfo, possibleCellIndex: number): TableCell {
    const actualIndex = clientInfo.possibleCellIndexes[possibleCellIndex];
    return table.cellPart.views.linear[actualIndex];
  }
}
