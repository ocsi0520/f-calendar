import { groupBy } from '../../../../utils/groupby';
import { TimeInterval } from '../../../TimeInterval/TimeInterval';
import { DayNumber } from '../../../TimeInterval/TimeInterval-constants';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table } from '../../Table';
import { MorningChecker } from './MorningChecker';
import { ScheduleSpecification } from '../specification';

export class LunchSpecification implements ScheduleSpecification {
  private static LUNCH_IN_MINUTES = 60;
  constructor(
    private readonly morningChecker: MorningChecker,
    private readonly timeIntervalManager: TimeIntervalManager,
  ) {}
  public check(table: Table): boolean {
    const occupiedCells = table.scheduleItems.filter(
      (scheduleItem) => scheduleItem.clientIdsInvolved.length,
    );
    const cellsByDay = this.groupCellsByDay(occupiedCells);
    for (let dayNumber in cellsByDay) {
      const dayCells = cellsByDay[Number(dayNumber) as DayNumber];
      const hasRoomForLunch = this.hasRoomForLunch(dayCells);
      if (!hasRoomForLunch) return false;
    }
    return true;
  }

  private hasRoomForLunch(occupiedDayCells: ScheduleItem[]): boolean {
    if (occupiedDayCells.length < 4) return true;
    const firstCell = occupiedDayCells[0];
    const dayNumber: DayNumber = firstCell.timeInterval.dayNumber;
    // this means, she'll eat breakfast later, so should eat lunch later
    if (this.morningChecker.isMorningSession(firstCell))
      return this.hasRoomForLunchWithPeriod(occupiedDayCells, {
        dayNumber,
        start: [13, 30],
        end: [15, 0],
      });
    return this.hasRoomForLunchWithPeriod(occupiedDayCells, {
      dayNumber,
      start: [13, 0],
      end: [14, 30],
    });
  }

  private hasRoomForLunchWithPeriod(occupiedDayCells: ScheduleItem[], lunchPeriod: TimeInterval) {
    const sessionsWithinLunchPeriod = occupiedDayCells.filter((cell) =>
      this.timeIntervalManager.areIntervalsOverlapping(lunchPeriod, cell.timeInterval),
    );
    if (sessionsWithinLunchPeriod.length === 0) return true;
    if (sessionsWithinLunchPeriod.length === 1) {
      const sessionInterval = sessionsWithinLunchPeriod[0].timeInterval;
      const earliestLunchSession = this.timeIntervalManager.shiftEnd(lunchPeriod, -30);
      const latestLunchSession = this.timeIntervalManager.shiftStart(lunchPeriod, 30);
      return !(
        this.timeIntervalManager.areIntervalsOverlapping(sessionInterval, earliestLunchSession) &&
        this.timeIntervalManager.areIntervalsOverlapping(sessionInterval, latestLunchSession)
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

  private groupCellsByDay(cells: Array<ScheduleItem>): Record<DayNumber, Array<ScheduleItem>> {
    return groupBy(cells, (cell) => cell.timeInterval.dayNumber);
  }
}
