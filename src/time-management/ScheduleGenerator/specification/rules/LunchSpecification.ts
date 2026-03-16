import { DayNumber } from '../../../definition/time-components';
import { Table, TableCell } from '../../Table';
import { ScheduleSpecification, NextValidStartResult } from '../specification';
import { MorningChecker } from './MorningChecker';
import { makeSameDayInterval, SameDayInterval } from '../../../definition/TimeInterval';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { TableUtils } from '../../TableManager/TableUtils';

export class LunchSpecification implements ScheduleSpecification {
  private static LUNCH_IN_MINUTES = 60;
  constructor(
    private readonly morningChecker: MorningChecker,
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly timeManager: TimeManager,
    private readonly tableUtils: TableUtils,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentCell = this.tableUtils.getCurrentCell(table, currentCellLinearIndex);
    const dayNumber = currentCell.timeInterval.dayNumber;
    const occupiedSameDayCells = this.tableUtils.getOccupiedCellsForDay(table, dayNumber);

    if (this.hasRoomForLunch(occupiedSameDayCells)) return null;

    return this.timeManager.shiftByGranularity({
      dayNumber,
      hour: currentCell.timeInterval.start.hour,
      minute: currentCell.timeInterval.start.minute,
    });
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
