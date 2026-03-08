import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../time-management/calendar/app-calendar/app-calendar';
import { Session } from '../../time-management/session';
// import { TableGenerator } from '../../time/ScheduleGenerator/utils/TableGenerator';
// import { Table } from '../../time/ScheduleGenerator/Table';
// import { ScheduleGenerator } from '../../time/ScheduleGenerator/ScheduleGenerator';

type Table = any;

@Component({
  selector: 'app-generate-week-schedule',
  imports: [MatButtonModule, AppCalendar],
  templateUrl: './app-generate-week-schedule.html',
  styleUrl: './app-generate-week-schedule.scss',
})
export class AppGenerateWeekSchedule {
  // private tableGenerator = inject(TableGenerator);
  // private scheduleGenerator = inject(ScheduleGenerator);
  public generatedData = signal<{ table: Table; schedule: Array<Session> } | null>(null);
  public generateSchedule(): void {
    let newTable: Table | undefined;
    try {
      // newTable = this.tableGenerator.generateTable();
      newTable = {};
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
    // TODO: finish
    console.log('generate w/', table);
    //   const prevDate = new Date();
    //   console.log('starting at', prevDate.toISOString());
    //   let finalDate!: Date;
    //   this.generatedData.set(null);
    //   try {
    //     // TODO: do the generation on a separate thread/worker or whatever
    //     // OR just make a simple setTimeout, so that the UI can show some loading
    //     const schedule = this.scheduleGenerator.generateScheduleFrom(table);
    //     this.generatedData.set({
    //       table: table,
    //       schedule,
    //     });
    //     finalDate = new Date();
    //   } catch (e) {
    //     finalDate = new Date();
    //     // TODO: snackbar and avoid next generation
    //     alert('error: ' + (e as Error).message);
    //   } finally {
    //     console.log('prevDate.toISOString()', prevDate.toISOString());
    //     console.log('finalDate.toISOString()', finalDate.toISOString());
    //     console.log('difference in seconds:', (finalDate.valueOf() - prevDate.valueOf()) / 1_000);
    //   }
  }
}
