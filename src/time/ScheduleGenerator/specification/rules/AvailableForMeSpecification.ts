import { MyTimeService } from '../../../../client/my-time.service';
import { WeekSchedule } from '../../../Schedule';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleCell, Table } from '../../Table';
import { ScheduleSpecification } from '../specification';

// TODO: unnecessary if ScheduleCellsNarrower is used
export class AvailableForMe implements ScheduleSpecification {
  private mySchedule: WeekSchedule;
  constructor(
    private readonly myTimeService: MyTimeService,
    private readonly timeIntervalManager: TimeIntervalManager,
  ) {
    this.mySchedule = this.myTimeService.loadSchedule();
  }
  public check(
    _table: Table,
    _cellsOnSameDay: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): boolean {
    return this.timeIntervalManager.isIntervalWithinSchedule(
      currentCell.timeInterval,
      this.mySchedule,
    );
  }
}
