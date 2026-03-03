import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { TimeManager } from '../TimeManager';
import { DayNumber } from './TimeInterval-constants';
import { WeekSchedule } from '../Schedule';
import { sessionGranularityInMinutes, sessionSpan } from '../session-span';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalManager {
  constructor(private timeManager: TimeManager) {}

  // edge-case if the intervals are the same
  // lunch case:
  // lunch interval: 13.30-14.30; session interval: 13.30-14.45 OR
  // lunch interval: 13.30-14.30; session interval: 13.15-14.30
  //  should be treated as overlapping (regardless of the order)
  public areIntervalsOverlapping(interval1: TimeInterval, interval2: TimeInterval): boolean {
    if (interval1.dayNumber !== interval2.dayNumber) return false;

    const [start1, end1] = this.mapIntervalToNumbers(interval1);
    const [start2, end2] = this.mapIntervalToNumbers(interval2);

    if (start1 === start2 && end1 === end2) return true;

    if (start2 <= start1 && start1 < end2) return true;
    if (start1 <= start2 && start2 < end1) return true;
    return false;
  }

  private mapIntervalToNumbers(interval: TimeInterval): [number, number] {
    return [
      this.timeManager.timeToNumber(interval.start),
      this.timeManager.timeToNumber(interval.end),
    ];
  }
  private mapNumbersToInterval(
    dayNumber: DayNumber,
    [startTimeRepresentation, endTimeRepresentation]: [number, number],
  ): TimeInterval {
    return {
      dayNumber,
      start: this.timeManager.numberToTime(startTimeRepresentation),
      end: this.timeManager.numberToTime(endTimeRepresentation),
    };
  }

  public doesFirstIncludeSecond(interval1: TimeInterval, interval2: TimeInterval): boolean {
    if (interval1.dayNumber !== interval2.dayNumber) return false;

    const [start1, end1] = this.mapIntervalToNumbers(interval1);
    const [start2, end2] = this.mapIntervalToNumbers(interval2);

    return start1 <= start2 && end2 <= end1;
  }

  // TODO: later on handle edge-case when we shift so much it goes to the next day
  // anyway TimeInterval does not handle case i.e. monday 23.30 - tuesday 00.45
  public shiftInterval(interval: TimeInterval, shiftByMinutes: number): TimeInterval {
    const [start, end] = this.mapIntervalToNumbers(interval);
    return this.mapNumbersToInterval(interval.dayNumber, [
      start + shiftByMinutes,
      end + shiftByMinutes,
    ]);
  }

  /**
   * Get the minutes between the earlier's end and the latter's start
   *
   * @example earlier: 1T09:15_-_10:30, later: 1T11:00_-_12:15 then returns 30
   */
  public getMinutesBetweenIntervals(earlier: TimeInterval, later: TimeInterval): number {
    return this.timeManager.timeToNumber(later.start) - this.timeManager.timeToNumber(earlier.end);
  }

  public shiftStart(interval: TimeInterval, shiftStartByMinutes: number): TimeInterval {
    const [start, end] = this.mapIntervalToNumbers(interval);
    return this.mapNumbersToInterval(interval.dayNumber, [start + shiftStartByMinutes, end]);
  }

  public shiftEnd(interval: TimeInterval, shiftEndByMinutes: number): TimeInterval {
    const [start, end] = this.mapIntervalToNumbers(interval);
    return this.mapNumbersToInterval(interval.dayNumber, [start, end + shiftEndByMinutes]);
  }

  // TODO: test
  public isIntervalWithinSchedule(interval: TimeInterval, schedule: WeekSchedule): boolean {
    return schedule.some((scheduleInterval) =>
      this.doesFirstIncludeSecond(scheduleInterval, interval),
    );
  }
  public shiftByGranularity(interval: TimeInterval): TimeInterval {
    return this.shiftInterval(interval, sessionGranularityInMinutes);
  }

  public shiftBySessionLength(interval: TimeInterval): TimeInterval {
    return this.shiftInterval(interval, sessionSpan.inMinutes);
  }

  public isIntervalAtOrAfterBase(examined: TimeInterval, base: TimeInterval): boolean {
    // TODO: proper DayTime and WeekTime and manage them instead of polluting TimeIntervalManager
    if (examined.dayNumber > base.dayNumber) return true;
    if (examined.dayNumber < base.dayNumber) return false;

    if (examined.start[0] > base.start[0]) return true;
    if (examined.start[0] < base.start[0]) return false;

    return examined.start[1] >= base.start[1];
  }
}
