import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../time-management/calendar/app-calendar/app-calendar';
import { Session } from '../../time-management/session';
import { ScheduleGenerator } from '../../time-management/ScheduleGenerator/ScheduleGenerator';
import { TableGenerator } from '../../time-management/ScheduleGenerator/table-generator/TableGenerator';
import { Table } from '../../time-management/ScheduleGenerator/Table';
import { TableMapper } from '../../time-management/ScheduleGenerator/TableMapper';

const tableGenerationLabel = 'table generation';

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, AppCalendar],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {
  private tableGenerator = inject(TableGenerator);
  private scheduleGenerator = inject(ScheduleGenerator);
  private tableMapper = inject(TableMapper);
  public generatedData = signal<{ table: Table; schedule: Array<Session> } | null>(null);

  public generateSchedule(): void {
    const newTable = this.generateNewTable();
    if (newTable) this.generateNextIterationWith(newTable);
  }

  private generateNewTable(): Table | undefined {
    try {
      return this.tableGenerator.generateTable();
    } catch (e) {
      // TODO: snackbar and avoid next generation
      alert('error at generation: ' + (e as Error).message);
      return undefined;
    }
  }

  public generateNextIteration(): void {
    const previousTable = this.generatedData()?.table;
    if (!previousTable) return;
    this.generateNextIterationWith(previousTable);
  }

  private generateNextIterationWith(table: Table): void {
    console.log('generate w/', table);
    console.time(tableGenerationLabel);
    this.generatedData.set(null);
    try {
      // TODO: do the generation on a separate web worker
      this.scheduleGenerator.createScheduleIn(table);
      const schedule = this.tableMapper.mapToSchedule(table);

      this.generatedData.set({
        table: table,
        schedule,
      });
      console.timeEnd(tableGenerationLabel);
    } catch (e) {
      console.timeEnd(tableGenerationLabel);
      // TODO: snackbar and avoid next generation
      alert('error: ' + (e as Error).message);
    }
  }
}
