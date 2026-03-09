import { Injectable } from '@angular/core';
import { Client } from '../../../client/Client';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { SameDayInterval } from '../../../definition/TimeInterval';

@Injectable({
  providedIn: 'root',
})
export class CellIntervalsNarrower {
  constructor(private sameDayIntervalManager: SameDayIntervalManager) {}

  public getSuitableSameDayIntervals(
    allPossibleIntervals: Array<SameDayInterval>,
    clientsInvolved: Array<Client>,
    myTime: Array<SameDayInterval>,
  ): Array<SameDayInterval> {
    const possibleCellsForMe = allPossibleIntervals.filter((possibleInterval) =>
      this.sameDayIntervalManager.isIntervalWithinSchedule(possibleInterval, myTime),
    );
    const allSchedulesFromClients = clientsInvolved.map((client) => client.schedule);
    const possibleCellsForMeAndAtLeastOneClient = possibleCellsForMe.filter((possibleInterval) =>
      allSchedulesFromClients.some((aClientSchedule) =>
        this.sameDayIntervalManager.isIntervalWithinSchedule(possibleInterval, aClientSchedule),
      ),
    );

    return possibleCellsForMeAndAtLeastOneClient;
  }
}
