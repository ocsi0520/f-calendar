import { Injectable } from '@angular/core';
import { Client } from '../../client/Client';
import { WeekSchedule } from '../Schedule';
import { TimeInterval } from '../TimeInterval/TimeInterval';

@Injectable({
  providedIn: 'root',
})
export class WeekScheduleGeneratorService {
  public getClientsWithNoOverlappingTime(
    mySchedule: WeekSchedule,
    allClients: Array<Client>,
  ): Array<Client> {
    return allClients.filter((client) => {
      const countOfProperInterval = client.schedule.filter((clientInterval) => {
        return mySchedule.some((myInterval) => this.check(myInterval, clientInterval));
      });
      const hasLessMatchesThanNeededSessions =
        countOfProperInterval.length < client.sessionCountsInWeek;
      return hasLessMatchesThanNeededSessions;
    });
  }
  private check(myTimeInterval: TimeInterval, clientInterval: TimeInterval): boolean {
    if (myTimeInterval.dayNumber !== clientInterval.dayNumber) return false;

    const myStartMinutes = myTimeInterval.start[0] * 60 + myTimeInterval.start[1];
    const clientStartMinutes = clientInterval.start[0] * 60 + clientInterval.start[1];

    const myEndMinutes = myTimeInterval.end[0] * 60 + myTimeInterval.end[1];
    const clientEndMinutes = clientInterval.end[0] * 60 + clientInterval.end[1];

    return myStartMinutes <= clientStartMinutes && clientEndMinutes <= myEndMinutes;
  }
}
