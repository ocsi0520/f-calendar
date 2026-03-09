import { Injectable } from '@angular/core';
import { Table, TableCell } from './Table';
import { Session } from '../session';

// TODO: test
@Injectable({ providedIn: 'root' })
export class TableMapper {
  public mapToSchedule(finishedTable: Table): Array<Session> {
    const occupiedCells = finishedTable.cellPart.views.linear.filter(
      (cell) => cell.clientIdsInvolved.length > 0,
    );
    return occupiedCells.map((cell) => {
      return {
        interval: cell.timeInterval,
        displayName: this.getDisplayNameFromCell(finishedTable, cell),
      };
    });
  }
  private getDisplayNameFromCell(table: Table, cell: TableCell): string {
    const involvedClientInfos = table.clientPart.clients.filter((clientInfo) =>
      cell.clientIdsInvolved.includes(clientInfo.client.id),
    );
    return involvedClientInfos.map((info) => info.client.name).join(' + ');
  }
}
