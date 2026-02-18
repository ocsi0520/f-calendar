import { TimeMapper } from '../../TimeMapper';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export class NoOverlappingSessionsSpecification implements ScheduleSpecification {
  constructor(private readonly timeMapper: TimeMapper) {}

  public check({ scheduleItems }: Table): boolean {
    const occupiedItem = scheduleItems.filter((item) => item.clientIdsInvolved.length > 0);
    for (let i = 0; i < occupiedItem.length - 1; i++) {
      if (this.areCellsOverlapping(scheduleItems[i], scheduleItems[i + 1])) return false;
    }
    return true;
  }

  private mapCellToTimeNumbers(cell: ScheduleItem): [number, number] {
    return [
      this.timeMapper.timeToNumber(cell.timeInterval.start),
      this.timeMapper.timeToNumber(cell.timeInterval.end),
    ];
  }
  private areCellsOverlapping(cell1: ScheduleItem, cell2: ScheduleItem): boolean {
    if (cell1.timeInterval.dayNumber !== cell2.timeInterval.dayNumber) return false;

    const [changedStart, changedEnd] = this.mapCellToTimeNumbers(cell1);
    const [cellStart, cellEnd] = this.mapCellToTimeNumbers(cell2);

    if (cellStart < changedStart && changedStart < cellEnd) return true;
    if (changedStart < cellStart && cellStart < changedEnd) return true;
    return false;
  }
}
