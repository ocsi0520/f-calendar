import { Injectable } from '@angular/core';
import { ScheduleItem, Table } from './Table';
import { DisplayableSchedule } from '../Schedule';

// TODO: test
@Injectable({ providedIn: 'root' })
export class TableMapper {
  public mapToSchedule(finishedTable: Table): DisplayableSchedule {
    const occupiedCells = finishedTable.scheduleItems.filter(
      (item) => item.clientIdsInvolved.length > 0,
    );
    return occupiedCells.map((cell) => {
      return {
        ...cell.timeInterval,
        displayName: this.getDisplayNameFromCell(finishedTable, cell),
      };
    });
  }
  private getDisplayNameFromCell(table: Table, cell: ScheduleItem): string {
    const involvedClientInfos = table.clientInfos.filter((clientInfo) =>
      cell.clientIdsInvolved.includes(clientInfo.client.id),
    );
    return involvedClientInfos.map((info) => info.client.name).join(' + ');
  }
}
