import { Injectable } from '@angular/core';
import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

@Injectable({ providedIn: 'root' })
export class TimeIntervalDeduplicator {
  constructor(private mapper: TimeIntervalPrimitiveMapper) {}

  public deDuplicate(timeIntervals: Array<TimeInterval>): Array<TimeInterval> {
    const setOfRepresentations = timeIntervals
      .map((interval) => this.mapper.mapToNumber(interval))
      .reduce((aSet, currIntervalRepresentation) => {
        aSet.add(currIntervalRepresentation);
        return aSet;
      }, new Set<number>());
    return Array.from(setOfRepresentations).map((numRepresentation) =>
      this.mapper.mapFromNumber(numRepresentation),
    );
  }
}
