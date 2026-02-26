import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ClientInfo, ScheduleItem, Table } from '../../Table';
import { ScheduleSpecification } from '../specification';

// later on this can be removed
export class AvailableForClientsSpecification implements ScheduleSpecification {
  constructor(private readonly timeIntervalManager: TimeIntervalManager) {}

  public check(
    table: Table,
    _cellsOnSameDay: Array<ScheduleItem>,
    currentCell: ScheduleItem,
  ): boolean {
    return this.clientHasFittingScheduleFor(currentCell, this.getCurrentClientInfo(table));
  }

  private getCurrentClientInfo(table: Table): ClientInfo {
    return table.clientInfos[table.currentClientIndex];
  }
  private clientHasFittingScheduleFor(occupiedCell: ScheduleItem, clientInfo: ClientInfo): boolean {
    return this.timeIntervalManager.isIntervalWithinSchedule(
      occupiedCell.timeInterval,
      clientInfo.client.schedule,
    );
  }
}
