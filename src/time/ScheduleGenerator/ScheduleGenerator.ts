import { Injectable } from '@angular/core';
import { ScheduleSpecification } from './specification/specification';
import { AvailableForClientsSpecification } from './specification/rules/AvailableForClientsSpecification';
import { TimeIntervalManager } from '../TimeInterval/TimeIntervalManager';
import { BreakfastSpecification } from './specification/rules/BreakfastSpecification';
import { TimeManager } from '../TimeManager';
import { MorningChecker } from './specification/rules/MorningChecker';
import { LunchSpecification } from './specification/rules/LunchSpecification';
import { NoOverlappingSessionsSpecification } from './specification/rules/NoOverlappingSessionsSpecification';
import { ProperPairsSpecification } from './specification/rules/ProperPairsSpecification';
import { ClientPairService } from '../../client/client-pair.service';
import { Table } from './Table';
import { DisplayableSchedule } from '../Schedule';
import { TableStepper } from './TableStepper';
import { TableMapper } from './utils/TableMapper';
import { SpecificationManager } from './specification/SpecificationManager';

// TODO: test
@Injectable({ providedIn: 'root' })
export class ScheduleGenerator {
  constructor(
    private timeIntervalManager: TimeIntervalManager,
    // private myTimeService: MyTimeService,
    private timeManager: TimeManager,
    private pairService: ClientPairService,
    private tableStepper: TableStepper,
    private tableMapper: TableMapper,
  ) {}

  private getAllSpecifications(): Array<ScheduleSpecification> {
    const morningChecker = new MorningChecker(this.timeManager);
    return [
      new AvailableForClientsSpecification(this.timeIntervalManager),
      // unnecessary because of narrower
      // new AvailableForMe(this.myTimeService, this.timeIntervalManager),
      new BreakfastSpecification(this.timeManager, morningChecker),
      new LunchSpecification(morningChecker, this.timeIntervalManager),
      new NoOverlappingSessionsSpecification(this.timeIntervalManager),
      // unnecessary because of optimization in TableStepper
      // new NoSameDayForSameClientSpecification(),
      new ProperPairsSpecification(this.pairService, this.timeIntervalManager),
    ];
  }

  private getSpecificationManager(): SpecificationManager {
    return new SpecificationManager(this.timeIntervalManager, this.getAllSpecifications());
  }

  // TODO: CQS violation, separate it
  public generateScheduleFrom(table: Table): DisplayableSchedule {
    const finishedTable = this.generateFinishedTable(table);
    return this.tableMapper.mapToSchedule(finishedTable);
  }

  private generateFinishedTable(table: Table): Table {
    let trialCounter = 0;
    const specManager = this.getSpecificationManager();
    // for next variation
    if (this.isTableDone(table)) this.tableStepper.step(table, specManager);
    while (!this.isTableDone(table) && !this.isImpossibleToFinish(table)) {
      if (trialCounter % 10_000_000 === 0) console.log(`counter: ${trialCounter}`);
      this.tableStepper.step(table, specManager);
      trialCounter++;
    }
    console.log('total amount of tries: ' + trialCounter);
    if (this.isImpossibleToFinish(table)) throw new Error('could not finish table');
    return table;
  }

  private isTableDone(table: Table): boolean {
    const lastClientInfo = table.clientInfos.at(-1)!;
    return lastClientInfo.joinedAt.length === lastClientInfo.client.sessionCountsInWeek;
  }
  private isImpossibleToFinish(table: Table): boolean {
    return table.currentClientIndex === -1;
  }
}
