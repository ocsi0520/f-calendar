import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { Table, TableCell } from '../../Table';
import { TableUtils } from '../../TableManager/TableUtils';
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
    private readonly tableUtils: TableUtils,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const dayNumber = currentCell.timeInterval.dayNumber;

    const [firstOccupiedCell, secondOccupiedCell] = this.tableUtils.getOccupiedCellsForDay(
      table,
      dayNumber,
    ) as FirstTwoOccupiedCells;

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

  private hasRoomForBreakfast(first: TableCell, second: TableCell): boolean {
    return (
      this.sameDayIntervalManager.getMinutesBetweenIntervals(
        first.timeInterval,
        second.timeInterval,
      ) >= BreakfastSpecification.BREAKFAST_IN_MINUTES
    );
  }
}
