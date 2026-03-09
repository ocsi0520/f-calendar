import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { Table, TableCell } from '../../Table';
import { ScheduleSpecification, Result } from '../specification';
import { MorningChecker } from './MorningChecker';

export class BreakfastSpecification implements ScheduleSpecification {
  private static BREAKFAST_IN_MINUTES = 45;
  constructor(
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly timeManager: TimeManager,
    private readonly morningChecker: MorningChecker,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): Result {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const dayNumber = currentCell.timeInterval.dayNumber;
    const sameDayCells = table.cellPart.views.byDay[dayNumber];

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
        firstValidStart: this.timeManager.shiftByGranularity({
          dayNumber,
          ...currentCell.timeInterval.start,
        }),
      },
      name: BreakfastSpecification.name,
    };
  }

  private hasRoomForBreakfast(dayCells: Array<TableCell>): boolean {
    if (dayCells.length < 2) return true;
    const [first, second] = dayCells.slice(0, 2);
    return (
      this.sameDayIntervalManager.getMinutesBetweenIntervals(
        first.timeInterval,
        second.timeInterval,
      ) >= BreakfastSpecification.BREAKFAST_IN_MINUTES
    );
  }
}
