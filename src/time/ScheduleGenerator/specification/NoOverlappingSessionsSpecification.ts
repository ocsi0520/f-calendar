import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export class NoOverlappingSessionsSpecification implements ScheduleSpecification {
  constructor(private readonly timeIntervalManager: TimeIntervalManager) {}

  public check({ scheduleItems }: Table): boolean {
    const occupiedItem = scheduleItems.filter((item) => item.clientIdsInvolved.length > 0);
    for (let i = 0; i < occupiedItem.length - 1; i++) {
      if (this.areCellsOverlapping(scheduleItems[i], scheduleItems[i + 1])) return false;
    }
    return true;
  }
  private areCellsOverlapping(cell1: ScheduleItem, cell2: ScheduleItem): boolean {
    return this.timeIntervalManager.areIntervalsOverlapping(cell1.timeInterval, cell2.timeInterval);
  }
}
