import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../calendar/app-calendar';
import { DisplayableSchedule } from '../../time/Schedule';
import { TableGenerator } from '../../time/ScheduleGenerator/utils/TableGenerator';
import { Table } from '../../time/ScheduleGenerator/Table';
import { ScheduleGenerator } from '../../time/ScheduleGenerator/ScheduleGenerator';

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, AppCalendar],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {
  private tableGenerator = inject(TableGenerator);
  private scheduleGenerator = inject(ScheduleGenerator);
  public generatedData = signal<{ table: Table; schedule: DisplayableSchedule } | null>(null);
  public generateSchedule(): void {
    let newTable: Table | undefined;
    try {
      newTable = this.tableGenerator.generateTable();
    } catch (e) {
      // TODO: snackbar and avoid next generation
      alert('error at generation: ' + (e as Error).message);
    }
    if (newTable) this.generateNextIterationWith(newTable);
  }
  public generateNextIteration(): void {
    const previousTable = this.generatedData()?.table;
    if (!previousTable) return;
    this.generateNextIterationWith(previousTable);
  }

  private generateNextIterationWith(table: Table): void {
    try {
      const schedule = this.scheduleGenerator.generateScheduleFrom(table);
      this.generatedData.set({
        table: table,
        schedule,
      });
    } catch (e) {
      // TODO: snackbar and avoid next generation
      alert('error: ' + (e as Error).message);
    }
  }
}
