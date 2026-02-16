import { sessionSpan } from '../session-span';
import { Hour, Minute, Time } from '../Time';
import { TimeInterval } from '../TimeInterval/TimeInterval';
import { DayNumber } from '../TimeInterval/TimeInterval-constants';
import { SessionCell } from './SessionCell';

export const sessionStartGranularityInMins = 15;

export class SessionCellGenerator {
  public generateAllPossibleCellsWith(freeSlotForPerson: TimeInterval): Array<SessionCell> {
    const startInMins = freeSlotForPerson.getInAbsoluteMinutes('start');
    const endInMins = freeSlotForPerson.getInAbsoluteMinutes('end');
    const sessionCells: Array<SessionCell> = [];
    for (
      let sessionStart = startInMins;
      sessionStart + sessionSpan.inMinutes <= endInMins;
      sessionStart += sessionStartGranularityInMins
    ) {
      sessionCells.push({
        timeInterval: this.generateSessionIntervalWith(freeSlotForPerson.dayNumber, sessionStart),
        status: 'available',
      });
    }
    return sessionCells;
  }

  private generateSessionIntervalWith(day: DayNumber, startInAbsoluteMins: number): TimeInterval {
    const endInAbsoluteMins = startInAbsoluteMins + sessionSpan.inMinutes;
    const startTime: Time = [
      Math.floor(startInAbsoluteMins / 60) as Hour,
      (startInAbsoluteMins % 60) as Minute,
    ];

    const endTime: Time = [
      Math.floor(endInAbsoluteMins / 60) as Hour,
      (endInAbsoluteMins % 60) as Minute,
    ];
    return new TimeInterval(day, startTime, endTime);
  }
}
