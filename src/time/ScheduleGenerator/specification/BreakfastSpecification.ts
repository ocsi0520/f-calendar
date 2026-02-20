import { groupBy } from '../../../utils/groupby';
import { DayNumber } from '../../TimeInterval/TimeInterval-constants';
import { TimeManager } from '../../TimeManager';
import { ScheduleItem, Table } from '../Table';
import { MorningChecker } from './MorningChecker';
import { ScheduleSpecification } from './specification';

export class BreakfastSpecification implements ScheduleSpecification {
  private static BREAKFAST_IN_MINUTES = 45;
  constructor(
    private readonly timeManager: TimeManager,
    private readonly morningChecker: MorningChecker,
  ) {}
  public check(table: Table): boolean {
    const occupiedCells = table.scheduleItems.filter(
      (scheduleItem) => scheduleItem.clientIdsInvolved.length,
    );
    const cellsByDay = this.groupCellsByDay(occupiedCells);
    for (let dayNumber in cellsByDay) {
      const dayCells = cellsByDay[Number(dayNumber) as DayNumber];
      const needBreakfastRoom = this.morningChecker.isMorningSession(dayCells[0]);
      if (!needBreakfastRoom) continue;

      const hasBreakfastRoom = this.hasRoomForBreakfast(dayCells);
      if (!hasBreakfastRoom) return false;
    }
    return true;
  }

  private hasRoomForBreakfast(dayCells: ScheduleItem[]): boolean {
    if (dayCells.length < 2) return true;
    const [first, second] = dayCells.slice(0, 2);
    const endOfFirst = this.timeManager.timeToNumber(first.timeInterval.end);
    const startOfSecond = this.timeManager.timeToNumber(second.timeInterval.start);
    return startOfSecond - endOfFirst >= BreakfastSpecification.BREAKFAST_IN_MINUTES;
  }

  private groupCellsByDay(cells: Array<ScheduleItem>): Record<DayNumber, Array<ScheduleItem>> {
    return groupBy(cells, (cell) => cell.timeInterval.dayNumber);
  }
}
