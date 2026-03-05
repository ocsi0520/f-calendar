import { Component, inject, OnInit, signal } from '@angular/core';
import { AppCalendar } from '../../time-management/calendar/app-calendar/app-calendar';
import { MyTimeService } from '../../time-management/my-time.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { SameDayInterval } from '../../time-management/definition/TimeInterval';
import { Session } from '../../time-management/session';

@Component({
  selector: 'app-my-time',
  imports: [AppCalendar, MatButtonModule],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime implements OnInit {
  private myTimeService = inject(MyTimeService);
  private snackBar = inject(MatSnackBar);
  public mySessions = signal<Array<Session>>([]);
  private backupSessions: Array<Session> = [];

  public ngOnInit(): void {
    const loadedSchedule = this.myTimeService.loadSchedule();
    const mySessions = this.mapScheduleToSessions(loadedSchedule);
    this.backupSessions = structuredClone(mySessions);
    this.mySessions.set(mySessions);
  }

  public reset(): void {
    this.mySessions.set(structuredClone(this.backupSessions));
  }

  public save(): void {
    const currentSessions = this.mySessions();
    const saveableSchedule = this.mapSessionsToSchedule(currentSessions);
    this.myTimeService.saveSchedule(saveableSchedule);
    this.backupSessions = structuredClone(currentSessions);
    this.snackBar.open('My schedule has been succesfully updated ✅', undefined, {
      duration: 2_000,
    });
  }

  private mapSessionsToSchedule(sessions: Array<Session>): Array<SameDayInterval> {
    return sessions.map((session) => session.interval);
  }
  private mapScheduleToSessions(schedule: Array<SameDayInterval>): Array<Session> {
    return schedule.map((interval) => ({ interval, displayName: 'my-time' }));
  }
}
