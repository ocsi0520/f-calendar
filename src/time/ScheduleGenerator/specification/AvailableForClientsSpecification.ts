import { ClientInfo, ScheduleItem, Table } from '../Table';
import { AvailableSpecification } from './AvailableSpecification';

export class AvailableForClientsSpecification extends AvailableSpecification {
  public check(table: Table): boolean {
    return this.getAllOccupiedCells(table).every((occupiedCell) =>
      this.clientsHaveFittingScheduleForCell(table, occupiedCell),
    );
  }
  private clientsHaveFittingScheduleForCell(table: Table, occupiedCell: ScheduleItem): boolean {
    return occupiedCell.clientIdsInvolved.every((clientId) =>
      this.clientHasFittingScheduleFor(occupiedCell, this.getClientInfo(table, clientId)),
    );
  }

  private getClientInfo(table: Table, clientId: number): ClientInfo {
    return table.clientInfos.find((clientInfo) => clientInfo.client.id === clientId)!;
  }
  private clientHasFittingScheduleFor(occupiedCell: ScheduleItem, clientInfo: ClientInfo): boolean {
    return this.withinSchedule(occupiedCell, clientInfo.client.schedule);
  }
}
