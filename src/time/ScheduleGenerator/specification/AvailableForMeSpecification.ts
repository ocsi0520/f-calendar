import { MyTimeService } from '../../../client/my-time.service';
import { WeekSchedule } from '../../Schedule';
import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { TimeMapper } from '../../TimeMapper';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export class AvailableForMe implements ScheduleSpecification {
  private mySchedule: WeekSchedule;
  constructor(
    private readonly myTimeService: MyTimeService,
    private readonly timeMapper: TimeMapper,
  ) {
    this.mySchedule = this.myTimeService.loadSchedule();
  }
  public check(table: Table): boolean {
    const allOccupiedItems = table.scheduleItems.filter(
      (item) => item.clientIdsInvolved.length > 0,
    );
    return allOccupiedItems.every((item) => this.withinMySchedule(item));
  }
  private withinMySchedule(item: ScheduleItem): boolean {
    return this.mySchedule.some((timeInterval) => this.itemWithinInterval(item, timeInterval));
  }
  private itemWithinInterval(item: ScheduleItem, myTimeInterval: TimeInterval): boolean {
    if (item.timeInterval.dayNumber !== myTimeInterval.dayNumber) return false;
    const [myTimeStart, myTimeEnd] = [
      this.timeMapper.timeToNumber(myTimeInterval.start),
      this.timeMapper.timeToNumber(myTimeInterval.end),
    ];
    const [itemStart, itemEnd] = [
      this.timeMapper.timeToNumber(item.timeInterval.start),
      this.timeMapper.timeToNumber(item.timeInterval.end),
    ];
    return myTimeStart <= itemStart && itemEnd <= myTimeEnd;
  }
}
