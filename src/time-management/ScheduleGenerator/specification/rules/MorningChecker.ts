import { TimeManager } from '../../../managers/TimeManager';
import { TableCell } from '../../Table';

export class MorningChecker {
  constructor(private readonly timeManager: TimeManager) {}
  // this means, she'll eat breakfast later
  public isMorningSession(firstCellOnDay: TableCell): boolean {
    return this.timeManager.isAtOrAfter(
      { dayNumber: 1, hour: 8, minute: 45 },
      { ...firstCellOnDay.timeInterval.start, dayNumber: 1 },
    );
  }
}
