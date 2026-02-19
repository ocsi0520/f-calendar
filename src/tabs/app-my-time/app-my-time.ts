import { Component, inject, OnInit, signal } from '@angular/core';
import { AppCalendar } from '../../calendar/app-calendar';
import { WeekSchedule } from '../../time/Schedule';
import { MyTimeService } from '../../client/my-time.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-time',
  imports: [AppCalendar],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime implements OnInit {
  private myTimeService = inject(MyTimeService);
  private snackBar = inject(MatSnackBar);
  public mySchedule = signal<WeekSchedule>([]);

  public ngOnInit(): void {
    this.mySchedule.set(this.myTimeService.loadSchedule());
  }

  public handleSave(schedule: WeekSchedule): void {
    this.mySchedule.set(schedule);
    this.myTimeService.saveSchedule(schedule);
    this.snackBar.open('My schedule has been succesfully updated ✅', undefined, { duration: 2_000 });
  }
}
