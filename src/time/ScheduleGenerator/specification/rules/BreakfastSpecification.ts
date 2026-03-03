import { ScheduleCell, Table } from '../../Table';
import { MorningChecker } from './MorningChecker';
import { Result, ScheduleSpecification } from '../specification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';

export class BreakfastSpecification implements ScheduleSpecification {
  private static BREAKFAST_IN_MINUTES = 45;
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly morningChecker: MorningChecker,
  ) {}
  public check(
    _table: Table,
    sameDayCells: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): Result {
    const occupiedDayCells = sameDayCells.filter(
      (scheduleCell) => scheduleCell.clientIdsInvolved.length,
    );
    const needBreakfastRoom = this.morningChecker.isMorningSession(occupiedDayCells[0]);
    if (!needBreakfastRoom) return { passed: true };

    if (this.hasRoomForBreakfast(occupiedDayCells)) return { passed: true };

    return {
      passed: false,
      nextTryHint: {
        // TODO: better
        firstValidInterval: this.timeIntervalManager.shiftByGranularity(currentCell.timeInterval),
      },
      name: BreakfastSpecification.name,
    };
  }

  private hasRoomForBreakfast(dayCells: ScheduleCell[]): boolean {
    if (dayCells.length < 2) return true;
    const [first, second] = dayCells.slice(0, 2);
    return (
      this.timeIntervalManager.getMinutesBetweenIntervals(
        first.timeInterval,
        second.timeInterval,
      ) >= BreakfastSpecification.BREAKFAST_IN_MINUTES
    );
  }
}
