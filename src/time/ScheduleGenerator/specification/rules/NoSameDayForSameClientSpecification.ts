import { ClientInfo, ScheduleItem, Table } from '../../Table';
import { ScheduleSpecification } from '../specification';

// TODO: delete
export class NoSameDayForSameClientSpecification implements ScheduleSpecification {
  public check(
    table: Table,
    cellsOnSameDay: Array<ScheduleItem>,
    _currentCell: ScheduleItem,
  ): boolean {
    const currentClientId = this.getCurrentClientInfo(table).client.id;
    let counterOfSameClientId = 0;
    for (let cell of cellsOnSameDay) {
      const indexOfClientId = cell.clientIdsInvolved.indexOf(currentClientId);
      if (indexOfClientId === -1) continue;

      const lastIndexOfClientId = cell.clientIdsInvolved.lastIndexOf(currentClientId);

      const multipleRegistrationsForSameCell = indexOfClientId !== lastIndexOfClientId;
      if (multipleRegistrationsForSameCell) return false;

      if (++counterOfSameClientId > 1) return false;
    }
    return true;
  }

  private getCurrentClientInfo(table: Table): ClientInfo {
    return table.clientInfos[table.currentClientIndex];
  }
}
