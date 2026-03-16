import { DayNumber } from '../../../definition/time-components';
import { ClientInfo, Table } from '../../Table';
import { TableUtils } from '../../TableManager/TableUtils';
import { NextValidStartResult, ScheduleSpecification } from '../specification';

export class NoFollowingDayFor2SessionsSpecification implements ScheduleSpecification {
  constructor(private tableUtils: TableUtils) {}
  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentClient = this.tableUtils.getCurrentClientInfo(table);
    if (currentClient.client.sessionCountsInWeek !== 2) return null;
    const currentCellDayNumber = this.tableUtils.getCurrentCell(table, currentCellLinearIndex)
      .timeInterval.dayNumber;
    if (currentCellDayNumber === 1) return null;

    if (!this.hasPrevDaySession(table, currentClient, currentCellDayNumber)) return null;

    if (currentCellDayNumber === 7)
      return { dayNumber: currentCellDayNumber, hour: 23, minute: 59 };
    return { dayNumber: (currentCellDayNumber + 1) as DayNumber, hour: 0, minute: 0 };
  }

  private hasPrevDaySession(
    table: Table,
    currentClient: ClientInfo,
    currentCellDayNumber: DayNumber,
  ): boolean {
    const prevDayNumber = (currentCellDayNumber - 1) as DayNumber;
    const [startIndex, lastIndex] = this.tableUtils.getIndexesForDay(table, prevDayNumber);
    for (let i = startIndex; i <= lastIndex; i++) {
      const currentCell = this.tableUtils.getCurrentCell(table, i);
      if (currentCell.clientIdsInvolved.includes(currentClient.client.id)) return true;
    }
    return false;
  }
}
