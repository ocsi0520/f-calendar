import { Injectable } from '@angular/core';
import { TableManager } from './TableManager/TableManager';
import { TableMapper } from './TableMapper';
import { Table } from './Table';
import { Session } from '../session';
import { SpecificationManagerFactory } from './SpecificationManagerFactory';
import { ScheduleDebugger } from './TableManager/ScheduleDebugger';

// TODO: test
@Injectable({ providedIn: 'root' })
export class ScheduleGenerator {
  constructor(
    private tableManager: TableManager,
    private tableMapper: TableMapper,
    private specManagerFactory: SpecificationManagerFactory,
    private scheduleDebugger: ScheduleDebugger,
  ) {}

  // TODO: CQS violation, separate it
  public generateScheduleFrom(table: Table): Array<Session> {
    const finishedTable = this.generateFinishedTable(table);
    return this.tableMapper.mapToSchedule(finishedTable);
  }

  private generateFinishedTable(table: Table): Table {
    if (this.tableManager.isFinished(table)) {
      // TODO: next variation
      return table;
    }

    this.stepTableUntilCompleted(table);

    if (this.tableManager.isImpossible(table)) {
      this.scheduleDebugger.logImpossibleTable(table);
      throw new Error('could not finish table');
    }
    return table;
  }

  private stepTableUntilCompleted(table: Table): void {
    let trialCounter = 0;
    const specManager = this.specManagerFactory.create();
    while (!this.tableManager.isFinished(table) && !this.tableManager.isImpossible(table)) {
      if (trialCounter % 10000000 === 0) console.log(`counter: ${trialCounter}`);
      this.tableManager.step(table, specManager);
      trialCounter++;
    }
    console.log('total amount of tries: ' + trialCounter);
  }
}
