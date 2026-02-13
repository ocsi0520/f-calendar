import { Component } from '@angular/core';
import { SchedulerManager } from '../../scheduler-manager/scheduler-manager';
import { WeekSchedule } from '../../time/Schedule';

@Component({
  selector: 'app-my-time',
  imports: [SchedulerManager],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime {
  public handleSave(schedule: WeekSchedule): void {
    console.log(schedule);
  }
}
