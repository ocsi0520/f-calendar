import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../calendar/app-calendar';

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, AppCalendar],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {}
