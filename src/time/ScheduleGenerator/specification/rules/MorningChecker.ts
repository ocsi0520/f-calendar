import { TimeManager } from '../../../TimeManager';
import { ScheduleCell } from '../../Table';

export class MorningChecker {
  constructor(private readonly timeMapper: TimeManager) {}
  // this means, she'll eat breakfast later
  public isMorningSession(scheduleCell: ScheduleCell): boolean {
    const startOfFirstSession = this.timeMapper.timeToNumber(scheduleCell.timeInterval.start);
    const hardLineForBreakfast = this.timeMapper.timeToNumber([8, 45]);
    return startOfFirstSession <= hardLineForBreakfast;
  }
}
