import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { SchedulerManager } from '../../scheduler-manager/scheduler-manager';

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, SchedulerManager],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {}
