import { Injectable } from '@angular/core';
import { SameDayInterval } from '../definition/TimeInterval';
import { Session } from '../session';

@Injectable({ providedIn: 'root' })
export class SessionMapper {
  public mapSessionsToSchedule(sessions: Array<Session>): Array<SameDayInterval> {
    return sessions.map((session) => session.interval);
  }
  public mapScheduleToSessions(
    schedule: Array<SameDayInterval>,
    displayName: string,
  ): Array<Session> {
    return schedule.map((interval) => ({ interval, displayName }));
  }
}
