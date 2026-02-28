import { Injectable } from '@angular/core';
import { ScheduleCell, Table } from '../Table';
import { DisplayableSchedule } from '../../Schedule';

// TODO: test
@Injectable({ providedIn: 'root' })
export class TableMapper {
  public mapToSchedule(finishedTable: Table): DisplayableSchedule {
    const occupiedCells = finishedTable.scheduleCells.filter(
      (cell) => cell.clientIdsInvolved.length > 0,
    );
    return occupiedCells.map((cell) => {
      return {
        ...cell.timeInterval,
        displayName: this.getDisplayNameFromCell(finishedTable, cell),
      };
    });
  }
  private getDisplayNameFromCell(table: Table, cell: ScheduleCell): string {
    const involvedClientInfos = table.clientInfos.filter((clientInfo) =>
      cell.clientIdsInvolved.includes(clientInfo.client.id),
    );
    return involvedClientInfos.map((info) => info.client.name).join(' + ');
  }
}
