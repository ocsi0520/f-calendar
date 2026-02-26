import { TimeManager } from '../../../TimeManager';
import { ScheduleItem, Table } from '../../Table';
import { MorningChecker } from './MorningChecker';
import { ScheduleSpecification } from '../specification';

export class BreakfastSpecification implements ScheduleSpecification {
  private static BREAKFAST_IN_MINUTES = 45;
  constructor(
    private readonly timeManager: TimeManager,
    private readonly morningChecker: MorningChecker,
  ) {}
  public check(
    _table: Table,
    sameDayCells: Array<ScheduleItem>,
    _currentCell: ScheduleItem,
  ): boolean {
    const occupiedDayCells = sameDayCells.filter(
      (scheduleItem) => scheduleItem.clientIdsInvolved.length,
    );
    const needBreakfastRoom = this.morningChecker.isMorningSession(occupiedDayCells[0]);
    if (!needBreakfastRoom) return true;

    return this.hasRoomForBreakfast(occupiedDayCells);
  }

  private hasRoomForBreakfast(dayCells: ScheduleItem[]): boolean {
    if (dayCells.length < 2) return true;
    const [first, second] = dayCells.slice(0, 2);
    const endOfFirst = this.timeManager.timeToNumber(first.timeInterval.end);
    const startOfSecond = this.timeManager.timeToNumber(second.timeInterval.start);
    return startOfSecond - endOfFirst >= BreakfastSpecification.BREAKFAST_IN_MINUTES;
  }
}
