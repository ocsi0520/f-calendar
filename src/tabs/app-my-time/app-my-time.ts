import { Component, inject, OnInit, signal } from '@angular/core';
import { SchedulerManager } from '../../scheduler-manager/scheduler-manager';
import { WeekSchedule } from '../../time/Schedule';
import { MyTimeService } from '../../client/my-time.service';

@Component({
  selector: 'app-my-time',
  imports: [SchedulerManager],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime implements OnInit {
  myTimeService = inject(MyTimeService);

  mySchedule = signal<WeekSchedule>([]);

  public ngOnInit(): void {
    this.mySchedule.set(this.myTimeService.loadSchedule());
  }

  public handleSave(schedule: WeekSchedule): void {
    this.mySchedule.set(schedule);
    this.myTimeService.saveSchedule(schedule);
  }
}
