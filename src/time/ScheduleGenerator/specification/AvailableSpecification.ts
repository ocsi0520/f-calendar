import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { WeekSchedule } from '../../Schedule';
import { TimeMapper } from '../../TimeMapper';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export abstract class AvailableSpecification implements ScheduleSpecification {
  constructor(private readonly timeMapper: TimeMapper) {}
  public abstract check(table: Table): boolean;

  protected withinSchedule(item: ScheduleItem, schedule: WeekSchedule): boolean {
    return schedule.some((timeInterval) => this.itemWithinInterval(item, timeInterval));
  }
  protected itemWithinInterval(item: ScheduleItem, timeInterval: TimeInterval): boolean {
    if (item.timeInterval.dayNumber !== timeInterval.dayNumber) return false;
    const [myTimeStart, myTimeEnd] = [
      this.timeMapper.timeToNumber(timeInterval.start),
      this.timeMapper.timeToNumber(timeInterval.end),
    ];
    const [itemStart, itemEnd] = [
      this.timeMapper.timeToNumber(item.timeInterval.start),
      this.timeMapper.timeToNumber(item.timeInterval.end),
    ];
    return myTimeStart <= itemStart && itemEnd <= myTimeEnd;
  }
  protected getAllOccupiedCells(table: Table): Array<ScheduleItem> {
    return table.scheduleItems.filter((item) => item.clientIdsInvolved.length > 0);
  }
}
