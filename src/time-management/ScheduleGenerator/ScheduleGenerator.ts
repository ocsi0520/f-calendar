import { Injectable } from '@angular/core';
import { TableManager } from './TableManager/TableManager';
import { Table } from './Table';
import { SpecificationManagerFactory } from './SpecificationManagerFactory';
import { ScheduleDebugger } from './TableManager/ScheduleDebugger';

// TODO: test
@Injectable({ providedIn: 'root' })
export class ScheduleGenerator {
  constructor(
    private tableManager: TableManager,
    private specManagerFactory: SpecificationManagerFactory,
    private scheduleDebugger: ScheduleDebugger,
  ) {}

  public createScheduleIn(table: Table): void {
    // TODO: finish next variation or delete the entire concept
    if (this.tableManager.isFinished(table)) return;

    this.stepTableUntilCompleted(table);

    if (this.tableManager.isImpossible(table)) {
      this.scheduleDebugger.logImpossibleTable(table, this.tableManager.getMaxClientIndex());
      throw new Error('could not finish table');
    }
  }

  private stepTableUntilCompleted(table: Table): void {
    const allPossibilities = this.scheduleDebugger.countAllPossibleVariations(table);
    console.log('allPossibilities', allPossibilities);

    console.log(
      'alternative possibilities',
      this.scheduleDebugger.getAlternativeAllCountOfVariations(table),
    );
    let trialCounter = 0;
    const specManager = this.specManagerFactory.create();
    while (!this.tableManager.isFinished(table) && !this.tableManager.isImpossible(table)) {
      if (trialCounter % 10000000 === 0)
        console.log(`counter: ${trialCounter}, ${(trialCounter / allPossibilities) * 100}% of all`);
      this.tableManager.step(table, specManager);
      trialCounter++;
    }
    console.log('total amount of tries: ' + trialCounter);
  }
}
