import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { Table, TableCell } from '../../Table';
import { ScheduleSpecification, NextValidStartResult } from '../specification';
import { MorningChecker } from './MorningChecker';

type FirstTwoOccupiedCells =
  | [TableCell, TableCell]
  | [TableCell, undefined]
  | [undefined, undefined];

export class BreakfastSpecification implements ScheduleSpecification {
  private static BREAKFAST_IN_MINUTES = 45;
  constructor(
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly timeManager: TimeManager,
    private readonly morningChecker: MorningChecker,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const dayNumber = currentCell.timeInterval.dayNumber;
    const sameDayCells = table.cellPart.views.byDay[dayNumber];

    const [firstOccupiedCell, secondOccupiedCell] = this.getFirstTwoOccupiedCells(sameDayCells);

    const isCurrentCellAmongFirstTwoOccupied =
      firstOccupiedCell === currentCell || secondOccupiedCell === currentCell;
    if (!isCurrentCellAmongFirstTwoOccupied || !secondOccupiedCell) return null;

    const needBreakfastRoom = this.morningChecker.isMorningSession(firstOccupiedCell);
    if (!needBreakfastRoom) return null;

    if (this.hasRoomForBreakfast(firstOccupiedCell, secondOccupiedCell)) return null;

    if (currentCell === secondOccupiedCell)
      return this.timeManager.shift(
        {
          dayNumber,
          hour: firstOccupiedCell.timeInterval.end.hour,
          minute: firstOccupiedCell.timeInterval.end.minute,
        },
        BreakfastSpecification.BREAKFAST_IN_MINUTES,
      );
    else
      return {
        dayNumber,
        hour: secondOccupiedCell.timeInterval.end.hour,
        minute: secondOccupiedCell.timeInterval.end.minute,
      };
  }

  private getFirstTwoOccupiedCells(sameDayCells: Array<TableCell>): FirstTwoOccupiedCells {
    const result = new Array(2) as FirstTwoOccupiedCells;
    // 7.00 -> 8.45 can optimize with max index in sameDayCell is 8
    // 7,7.15,7.30,7.45,8.00,8.15,8.30,8.45
    let count = 0;
    for (const sameDayCell of sameDayCells) {
      if (sameDayCell.clientIdsInvolved.length) {
        result[count++] = sameDayCell;
        if (count === 2) return result;
      }
    }
    return result;
  }

  private hasRoomForBreakfast(first: TableCell, second: TableCell): boolean {
    return (
      this.sameDayIntervalManager.getMinutesBetweenIntervals(
        first.timeInterval,
        second.timeInterval,
      ) >= BreakfastSpecification.BREAKFAST_IN_MINUTES
    );
  }
}
