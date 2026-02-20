import { MyTimeService } from '../../../client/my-time.service';
import { WeekSchedule } from '../../Schedule';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { Table } from '../Table';
import { AvailableSpecification } from './AvailableSpecification';

// TODO: unnecessary if ScheduleItemsNarrower is used
export class AvailableForMe extends AvailableSpecification {
  private mySchedule: WeekSchedule;
  constructor(
    private readonly myTimeService: MyTimeService,
    timeIntervalManager: TimeIntervalManager,
  ) {
    super(timeIntervalManager);
    this.mySchedule = this.myTimeService.loadSchedule();
  }
  public check(table: Table): boolean {
    return this.getAllOccupiedCells(table).every((item) =>
      this.withinSchedule(item, this.mySchedule),
    );
  }
}
