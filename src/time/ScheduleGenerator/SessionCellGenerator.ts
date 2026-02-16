import { sessionSpan } from '../session-span';
import { inject, Injectable } from '@angular/core';
import { TimeInterval } from '../TimeInterval/TimeInterval';
import { SessionCell } from './SessionCell';
import { TimeIntervalPrimitiveMapper } from '../TimeInterval/TimeIntervalPrimitiveMapper';

export const sessionStartGranularityInMins = 15;

@Injectable({
  providedIn: 'root',
})
export class SessionCellGenerator {
  private primitiveMapper = inject(TimeIntervalPrimitiveMapper);
  private readonly NUMBER_BASE = TimeIntervalPrimitiveMapper.NUMBER_BASE;
  private readonly STEP_SHIFT_15_MINS =
    sessionStartGranularityInMins * TimeIntervalPrimitiveMapper.NUMBER_BASE +
    sessionStartGranularityInMins;

  public generateAllPossibleCellsWith(freeSlotForPerson: TimeInterval): Array<SessionCell> {
    const startNumberRepresentation = this.encodeTimeIntervalStart(freeSlotForPerson);
    const sessionCells: Array<SessionCell> = [];

    let currentNumberRepresentation = startNumberRepresentation;
    let currentTimeInterval = this.primitiveMapper.mapFromNumber(currentNumberRepresentation);

    while (this.isWithinSlot(currentTimeInterval, freeSlotForPerson)) {
      sessionCells.push({
        timeInterval: currentTimeInterval,
        status: 'available',
      });
      currentNumberRepresentation += this.STEP_SHIFT_15_MINS;
      currentTimeInterval = this.primitiveMapper.mapFromNumber(currentNumberRepresentation);
    }

    return sessionCells;
  }

  private encodeTimeIntervalStart(timeInterval: TimeInterval): number {
    const startInMinutes =
      (timeInterval.dayNumber - 1) * 24 * 60 + timeInterval.start[0] * 60 + timeInterval.start[1];
    const endInMinutes = startInMinutes + sessionSpan.inMinutes;
    return startInMinutes * this.NUMBER_BASE + endInMinutes;
  }

  private isWithinSlot(
    currentTimeInterval: TimeInterval,
    freeSlotForPerson: TimeInterval,
  ): boolean {
    return !(
      currentTimeInterval.end[0] > freeSlotForPerson.end[0] ||
      (currentTimeInterval.end[0] === freeSlotForPerson.end[0] &&
        currentTimeInterval.end[1] > freeSlotForPerson.end[1])
    );
  }
}
