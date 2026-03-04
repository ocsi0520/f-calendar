import { Injectable } from '@angular/core';
import { SameDayInterval } from '../definition/TimeInterval';
import { TimeManager } from './TimeManager';
import { WeekTime } from '../definition/WeekTime';
import { TimeMapper } from '../mappers/TimeMapper';
import { sessionTime, timeGranularityInMins } from '../session';

@Injectable({
  providedIn: 'root',
})
export class SameDayIntervalManager {
  constructor(
    private timeManager: TimeManager,
    private timeMapper: TimeMapper,
  ) {}

  // edge-case if the intervals are the same
  // lunch case:
  // lunch interval: 13.30-14.30; session interval: 13.30-14.45 OR
  // lunch interval: 13.30-14.30; session interval: 13.15-14.30
  //  should be treated as overlapping (regardless of the order)
  public areIntervalsOverlapping(interval1: SameDayInterval, interval2: SameDayInterval): boolean {
    if (interval1.dayNumber !== interval2.dayNumber) return false;

    const [start1, end1] = [
      this.timeMapper.dayTimeToNumber(interval1.start),
      this.timeMapper.dayTimeToNumber(interval1.end),
    ];
    const [start2, end2] = [
      this.timeMapper.dayTimeToNumber(interval2.start),
      this.timeMapper.dayTimeToNumber(interval2.end),
    ];

    if (start1 === start2 && end1 === end2) return true;

    if (start2 <= start1 && start1 < end2) return true;
    if (start1 <= start2 && start2 < end1) return true;
    return false;
  }

  public doesFirstIncludeSecond(interval1: SameDayInterval, interval2: SameDayInterval): boolean {
    if (interval1.dayNumber !== interval2.dayNumber) return false;

    const [start1, end1] = [
      this.timeMapper.dayTimeToNumber(interval1.start),
      this.timeMapper.dayTimeToNumber(interval1.end),
    ];
    const [start2, end2] = [
      this.timeMapper.dayTimeToNumber(interval2.start),
      this.timeMapper.dayTimeToNumber(interval2.end),
    ];

    return start1 <= start2 && end2 <= end1;
  }

  public shiftInterval(interval: SameDayInterval, shiftByMinutes: number): SameDayInterval {
    return this.shiftIntervalBothEnds(interval, shiftByMinutes, shiftByMinutes);
  }

  /**
   * Get the minutes between the earlier's end and the latter's start
   *
   * @example earlier: 1T09:15_-_10:30, later: 1T11:00_-_12:15 then returns 30
   */
  public getMinutesBetweenIntervals(earlier: SameDayInterval, later: SameDayInterval): number {
    return (
      this.timeMapper.dayTimeToNumber(later.start) - this.timeMapper.dayTimeToNumber(earlier.end)
    );
  }

  public shiftStart(interval: SameDayInterval, shiftStartByMinutes: number): SameDayInterval {
    return this.shiftIntervalBothEnds(interval, shiftStartByMinutes, 0);
  }

  public shiftEnd(interval: SameDayInterval, shiftEndByMinutes: number): SameDayInterval {
    return this.shiftIntervalBothEnds(interval, 0, shiftEndByMinutes);
  }

  // TODO: test
  public isIntervalWithinSchedule(
    interval: SameDayInterval,
    schedule: Array<SameDayInterval>,
  ): boolean {
    return schedule.some((scheduleInterval) =>
      this.doesFirstIncludeSecond(scheduleInterval, interval),
    );
  }
  public shiftByGranularity(interval: SameDayInterval): SameDayInterval {
    return this.shiftInterval(interval, timeGranularityInMins);
  }

  public shiftBySessionLength(interval: SameDayInterval): SameDayInterval {
    return this.shiftInterval(interval, sessionTime.inMinutes);
  }

  public isIntervalAtOrAfterBase(examined: SameDayInterval, base: SameDayInterval): boolean {
    const startTimeOfExamined: WeekTime = { dayNumber: examined.dayNumber, ...examined.start };
    const startTimeOfBase: WeekTime = { dayNumber: base.dayNumber, ...base.start };
    return this.timeManager.isAtOrAfter(startTimeOfExamined, startTimeOfBase);
  }

  // TODO: later on handle edge-case when we shift so much it goes to the next day
  // anyway SameDayInterval does not handle case i.e. monday 23.30 - tuesday 00.45
  private shiftIntervalBothEnds(
    interval: SameDayInterval,
    shiftStartByMinutes: number,
    shiftEndByMinutes: number,
  ): SameDayInterval {
    return {
      dayNumber: interval.dayNumber,
      start: this.timeMapper.dayTimeFromNumber(
        this.timeMapper.dayTimeToNumber(interval.start) + shiftStartByMinutes,
      ),
      end: this.timeMapper.dayTimeFromNumber(
        this.timeMapper.dayTimeToNumber(interval.end) + shiftEndByMinutes,
      ),
    };
  }
}
