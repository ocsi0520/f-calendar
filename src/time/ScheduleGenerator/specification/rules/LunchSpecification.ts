import { TimeInterval } from '../../../TimeInterval/TimeInterval';
import { DayNumber } from '../../../TimeInterval/TimeInterval-constants';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table } from '../../Table';
import { MorningChecker } from './MorningChecker';
import { Result, ScheduleSpecification } from '../specification';

export class LunchSpecification implements ScheduleSpecification {
  private static LUNCH_IN_MINUTES = 60;
  constructor(
    private readonly morningChecker: MorningChecker,
    private readonly timeIntervalManager: TimeIntervalManager,
  ) {}
  public check(
    _table: Table,
    sameDayCells: Array<ScheduleItem>,
    currentCell: ScheduleItem,
  ): Result {
    const occupiedSameDayCells = sameDayCells.filter(
      (scheduleItem) => scheduleItem.clientIdsInvolved.length,
    );
    if (this.hasRoomForLunch(occupiedSameDayCells)) return { passed: true };

    return {
      passed: false,
      nextTryHint: {
        // TODO: better
        firstValidInterval: this.timeIntervalManager.shiftByGranularity(currentCell.timeInterval),
      },
    };
  }

  private hasRoomForLunch(occupiedDayCells: ScheduleItem[]): boolean {
    if (occupiedDayCells.length < 4) return true;

    return this.hasRoomForLunchWithPeriod(occupiedDayCells, this.getLunchPeriod(occupiedDayCells));
  }

  private hasRoomForLunchWithPeriod(
    occupiedDayCells: ScheduleItem[],
    lunchPeriod: TimeInterval,
  ): boolean {
    const sessionsWithinLunchPeriod = occupiedDayCells.filter((cell) =>
      this.timeIntervalManager.areIntervalsOverlapping(lunchPeriod, cell.timeInterval),
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
      this.timeIntervalManager.getMinutesBetweenIntervals(
        sessionsWithinLunchPeriod[0].timeInterval,
        sessionsWithinLunchPeriod[1].timeInterval,
      ) >= LunchSpecification.LUNCH_IN_MINUTES
    );
  }

  private hasRoomForLunchWithOneOverlap(
    overlappingTimeInterval: TimeInterval,
    lunchPeriod: TimeInterval,
  ): boolean {
    const earliestLunchSession = this.timeIntervalManager.shiftEnd(lunchPeriod, -30);
    const latestLunchSession = this.timeIntervalManager.shiftStart(lunchPeriod, 30);
    const neitherEarlierNorLaterLunchIsPossible =
      this.timeIntervalManager.areIntervalsOverlapping(
        overlappingTimeInterval,
        earliestLunchSession,
      ) &&
      this.timeIntervalManager.areIntervalsOverlapping(overlappingTimeInterval, latestLunchSession);
    return !neitherEarlierNorLaterLunchIsPossible;
  }

  private getLunchPeriod([firstCell]: ScheduleItem[]): TimeInterval {
    const dayNumber: DayNumber = firstCell.timeInterval.dayNumber;
    const laterLunchWhenBreakfast: TimeInterval = {
      dayNumber,
      start: [13, 30],
      end: [15, 0],
    };
    const earlierLunchWhenNoBreakfast: TimeInterval = {
      dayNumber,
      start: [13, 0],
      end: [14, 30],
    };

    const hadBreakfast = this.morningChecker.isMorningSession(firstCell);
    return hadBreakfast ? laterLunchWhenBreakfast : earlierLunchWhenNoBreakfast;
  }
}
