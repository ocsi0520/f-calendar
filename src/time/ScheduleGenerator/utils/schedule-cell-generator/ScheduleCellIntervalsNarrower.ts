import { Injectable } from '@angular/core';
import { WeekSchedule } from '../../../Schedule';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { Client } from '../../../../client/Client';
import { TimeInterval } from '../../../TimeInterval/TimeInterval';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ScheduleCellIntervalsNarrower {
  constructor(private timeIntervalManager: TimeIntervalManager) {}

  public getSuitableTimeIntervals(
    allPossibleTimeIntervalIntervals: Array<TimeInterval>,
    clientsInvolved: Array<Client>,
    myTime: WeekSchedule,
  ): Array<TimeInterval> {
    const possibleCellsForMe = allPossibleTimeIntervalIntervals.filter((possibleInterval) =>
      this.timeIntervalManager.isIntervalWithinSchedule(possibleInterval, myTime),
    );
    const allSchedulesFromClients = clientsInvolved.map((client) => client.schedule);
    const possibleCellsForMeAndAtLeastOneClient = possibleCellsForMe.filter((possibleInterval) =>
      allSchedulesFromClients.some((aClientSchedule) =>
        this.timeIntervalManager.isIntervalWithinSchedule(possibleInterval, aClientSchedule),
      ),
    );

    return possibleCellsForMeAndAtLeastOneClient;
  }
}
