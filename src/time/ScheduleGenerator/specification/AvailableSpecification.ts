import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { WeekSchedule } from '../../Schedule';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';

export abstract class AvailableSpecification implements ScheduleSpecification {
  constructor(private readonly timeIntervalManager: TimeIntervalManager) {}
  public abstract check(table: Table): boolean;

  protected withinSchedule(item: ScheduleItem, schedule: WeekSchedule): boolean {
    return schedule.some((timeInterval) => this.itemWithinInterval(item, timeInterval));
  }

  private itemWithinInterval(item: ScheduleItem, timeInterval: TimeInterval): boolean {
    return this.timeIntervalManager.doesFirstIncludeSecond(timeInterval, item.timeInterval);
  }
  protected getAllOccupiedCells(table: Table): Array<ScheduleItem> {
    return table.scheduleItems.filter((item) => item.clientIdsInvolved.length > 0);
  }
}
