import { Result, ScheduleSpecification } from './specification';
import { Table } from '../Table';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { sessionGranularityInMinutes } from '../../session-span';

export class SpecificationManager {
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly allSpecifications: Array<ScheduleSpecification>,
  ) {}

  public checkSpecifications(table: Table): Result {
    // from table, we can get the current cell, day and whole week later
    const hasPassed = this.allSpecifications.every((spec) => spec.check(table));
    if (hasPassed) return { passed: true };
    else {
      const currentInterval = table.scheduleItems[table.currentScheduleItemIndex].timeInterval;
      // TODO: ScheduleSpecification should return Result, and pick the furthest time from it
      const shiftedByGranularity = this.timeIntervalManager.shiftInterval(
        currentInterval,
        sessionGranularityInMinutes,
      );
      return { passed: false, nextTryHint: { firstValidInterval: shiftedByGranularity } };
    }
  }
}
