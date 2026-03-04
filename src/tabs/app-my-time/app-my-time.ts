import { Component, inject, OnInit, signal } from '@angular/core';
import { AppCalendar } from '../../time-management/calendar-component/app-calendar';
import { WeekSchedule } from '../../time/Schedule';
import { MyTimeService } from '../../time-management/my-time.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-my-time',
  imports: [AppCalendar, MatButtonModule],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime implements OnInit {
  private myTimeService = inject(MyTimeService);
  private snackBar = inject(MatSnackBar);
  public mySchedule = signal<WeekSchedule>([]);
  private backupSchedule: WeekSchedule = [];

  public ngOnInit(): void {
    const loadedSchedule = this.myTimeService.loadSchedule();
    this.backupSchedule = structuredClone(loadedSchedule);
    this.mySchedule.set(loadedSchedule);
  }

  public reset(): void {
    this.mySchedule.set(structuredClone(this.backupSchedule));
  }

  public save(): void {
    const saveableSchedule = this.mySchedule();
    this.myTimeService.saveSchedule(saveableSchedule);
    this.backupSchedule = structuredClone(saveableSchedule);
    this.snackBar.open('My schedule has been succesfully updated ✅', undefined, {
      duration: 2_000,
    });
  }
}
