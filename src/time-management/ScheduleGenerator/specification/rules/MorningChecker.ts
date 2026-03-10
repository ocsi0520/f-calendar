import { TableCell } from '../../Table';

export class MorningChecker {
  // this means, she'll eat breakfast later
  public isMorningSession(firstCellOnDay: TableCell): boolean {
    return firstCellOnDay.timeInterval.start.hour < 9;
  }
}
