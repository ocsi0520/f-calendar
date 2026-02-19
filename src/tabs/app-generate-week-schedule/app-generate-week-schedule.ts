import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../calendar/app-calendar';
import { WeekSchedule } from '../../time/Schedule';

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, AppCalendar],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {
  public weekSchedule = signal<WeekSchedule>([]);
}
