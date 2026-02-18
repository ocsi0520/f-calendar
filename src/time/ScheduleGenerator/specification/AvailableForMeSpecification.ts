import { MyTimeService } from '../../../client/my-time.service';
import { WeekSchedule } from '../../Schedule';
import { TimeMapper } from '../../TimeMapper';
import { Table } from '../Table';
import { AvailableSpecification } from './AvailableSpecification';

export class AvailableForMe extends AvailableSpecification {
  private mySchedule: WeekSchedule;
  constructor(
    private readonly myTimeService: MyTimeService,
    timeMapper: TimeMapper,
  ) {
    super(timeMapper);
    this.mySchedule = this.myTimeService.loadSchedule();
  }
  public check(table: Table): boolean {
    return this.getAllOccupiedCells(table).every((item) =>
      this.withinSchedule(item, this.mySchedule),
    );
  }
}
