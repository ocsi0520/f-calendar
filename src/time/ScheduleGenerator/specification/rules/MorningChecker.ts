import { TimeManager } from '../../../TimeManager';
import { ScheduleItem } from '../../Table';

export class MorningChecker {
  constructor(private readonly timeMapper: TimeManager) {}
  // this means, she'll eat breakfast later
  public isMorningSession(scheduleItem: ScheduleItem): boolean {
    const startOfFirstSession = this.timeMapper.timeToNumber(scheduleItem.timeInterval.start);
    const hardLineForBreakfast = this.timeMapper.timeToNumber([8, 45]);
    return startOfFirstSession <= hardLineForBreakfast;
  }
}
