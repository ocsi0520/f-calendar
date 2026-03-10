import { TimeInterval } from 'rxjs';
import { DayNumber } from '../../../definition/time-components';
import { Table, TableCell } from '../../Table';
import { ScheduleSpecification, Result } from '../specification';
import { MorningChecker } from './MorningChecker';
import { makeSameDayInterval, SameDayInterval } from '../../../definition/TimeInterval';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';

export class LunchSpecification implements ScheduleSpecification {
  private static LUNCH_IN_MINUTES = 60;
  constructor(
    private readonly morningChecker: MorningChecker,
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly timeManager: TimeManager,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): Result {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const dayNumber = currentCell.timeInterval.dayNumber;
    const sameDayCells = table.cellPart.views.byDay[dayNumber];

    const occupiedSameDayCells = sameDayCells.filter(
      (scheduleCell) => scheduleCell.clientIdsInvolved.length,
    );
    if (this.hasRoomForLunch(occupiedSameDayCells)) return { passed: true };

    return {
      passed: false,
      nextTryHint: {
        // TODO: better
        firstValidStart: this.timeManager.shiftByGranularity({
          dayNumber,
          hour: currentCell.timeInterval.start.hour,
          minute: currentCell.timeInterval.start.minute,
        }),
      },
      name: LunchSpecification.name,
    };
  }

  private hasRoomForLunch(occupiedDayCells: Array<TableCell>): boolean {
    if (occupiedDayCells.length < 4) return true;

    return this.hasRoomForLunchWithPeriod(occupiedDayCells, this.getLunchPeriod(occupiedDayCells));
  }

  private hasRoomForLunchWithPeriod(
    occupiedDayCells: Array<TableCell>,
    lunchPeriod: SameDayInterval,
  ): boolean {
    const sessionsWithinLunchPeriod = occupiedDayCells.filter((cell) =>
      this.sameDayIntervalManager.areIntervalsOverlapping(lunchPeriod, cell.timeInterval),
    );
    if (sessionsWithinLunchPeriod.length === 0) return true;
    if (sessionsWithinLunchPeriod.length === 1) {
      return this.hasRoomForLunchWithOneOverlap(
        sessionsWithinLunchPeriod[0].timeInterval,
        lunchPeriod,
      );
    }
    // overlapping cells must be 2
    return (
      this.sameDayIntervalManager.getMinutesBetweenIntervals(
        sessionsWithinLunchPeriod[0].timeInterval,
        sessionsWithinLunchPeriod[1].timeInterval,
      ) >= LunchSpecification.LUNCH_IN_MINUTES
    );
  }

  private hasRoomForLunchWithOneOverlap(
    overlappingTimeInterval: SameDayInterval,
    lunchPeriod: SameDayInterval,
  ): boolean {
    const earliestLunchSession = this.sameDayIntervalManager.shiftEnd(lunchPeriod, -30);
    const latestLunchSession = this.sameDayIntervalManager.shiftStart(lunchPeriod, 30);
    const neitherEarlierNorLaterLunchIsPossible =
      this.sameDayIntervalManager.areIntervalsOverlapping(
        overlappingTimeInterval,
        earliestLunchSession,
      ) &&
      this.sameDayIntervalManager.areIntervalsOverlapping(
        overlappingTimeInterval,
        latestLunchSession,
      );
    return !neitherEarlierNorLaterLunchIsPossible;
  }

  private getLunchPeriod([firstCell]: Array<TableCell>): SameDayInterval {
    const dayNumber: DayNumber = firstCell.timeInterval.dayNumber;
    const laterLunchWhenBreakfast: SameDayInterval = makeSameDayInterval(
      dayNumber,
      [13, 30],
      [15, 0],
    );
    const earlierLunchWhenNoBreakfast: SameDayInterval = makeSameDayInterval(
      dayNumber,
      [13, 0],
      [14, 30],
    );

    const hadBreakfast = this.morningChecker.isMorningSession(firstCell);
    return hadBreakfast ? laterLunchWhenBreakfast : earlierLunchWhenNoBreakfast;
  }
}
