import { groupBy } from '../../../utils/groupby';
import { DayNumber } from '../../TimeInterval/TimeInterval-constants';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export class NoSameDayForSameClientSpecification implements ScheduleSpecification {
  public check(table: Table): boolean {
    const occupiedCells = table.scheduleItems.filter(
      (scheduleItem) => scheduleItem.clientIdsInvolved.length,
    );
    const cellsByDay = this.groupCellsByDay(occupiedCells);
    for (let dayNumber in cellsByDay) {
      const dayCells = cellsByDay[Number(dayNumber) as DayNumber];
      const dayHasClientDuplication = this.dayHasClientIdDuplication(dayCells);
      if (dayHasClientDuplication) return false;
    }
    return true;
  }
  private groupCellsByDay(cells: Array<ScheduleItem>): Record<DayNumber, Array<ScheduleItem>> {
    return groupBy(cells, (cell) => cell.timeInterval.dayNumber);
  }
  private dayHasClientIdDuplication(dayCells: ScheduleItem[]): boolean {
    const clientIdsInvolvedInThatDay = dayCells.map((dayCell) => dayCell.clientIdsInvolved).flat(1);
    const set = new Set<number>();
    for (let clientId of clientIdsInvolvedInThatDay) {
      if (set.has(clientId)) return true;
      set.add(clientId);
    }
    return false;
  }
}
