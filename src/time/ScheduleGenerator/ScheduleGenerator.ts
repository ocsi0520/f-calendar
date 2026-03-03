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
import { TableStepper } from './Stepper/TableStepper';
import { TableMapper } from './utils/TableMapper';
import { SpecificationManager } from './specification/SpecificationManager';
import { TimeIntervalPrimitiveMapper } from '../TimeInterval/TimeIntervalPrimitiveMapper';
import { NoSameDayForSameClientSpecification } from './specification/rules/NoSameDayForSameClientSpecification';
import { AvailableForMe } from './specification/rules/AvailableForMeSpecification';
import { MyTimeService } from '../../client/my-time.service';

type DebugClientInfo = {
  sessionCount: number;
  name: string;
  possibleIntervalRepresentations: Array<string>;
};

// TODO: test
@Injectable({ providedIn: 'root' })
export class ScheduleGenerator {
  constructor(
    private timeIntervalManager: TimeIntervalManager,
    private myTimeService: MyTimeService,
    private timeManager: TimeManager,
    private pairService: ClientPairService,
    private tableStepper: TableStepper,
    private tableMapper: TableMapper,
    private primitivemapper: TimeIntervalPrimitiveMapper,
  ) {}

  private getAllSpecifications(): Array<ScheduleSpecification> {
    const morningChecker = new MorningChecker(this.timeManager);
    return [
      new AvailableForClientsSpecification(this.timeIntervalManager),
      // unnecessary because of narrower
      new AvailableForMe(this.myTimeService, this.timeIntervalManager),
      new BreakfastSpecification(this.timeIntervalManager, morningChecker),
      new LunchSpecification(morningChecker, this.timeIntervalManager),
      new NoOverlappingSessionsSpecification(this.timeIntervalManager),
      // unnecessary because of optimization in TableStepper
      new NoSameDayForSameClientSpecification(),
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

    if (this.isTableDone(table)) this.tableStepper.startNextVariation(table);

    while (!this.isTableDone(table) && !this.isImpossibleToFinish(table)) {
      if (trialCounter % 10_000_000 === 0) console.log(`counter: ${trialCounter}`);
      this.tableStepper.step(table, specManager);
      trialCounter++;
    }
    console.log('total amount of tries: ' + trialCounter);
    if (this.isImpossibleToFinish(table)) {
      this.logPlusInfo(table);

      throw new Error('could not finish table');
    }
    return table;
  }

  private isTableDone(table: Table): boolean {
    const lastClientInfo = table.clientInfos.at(-1)!;
    return lastClientInfo.joinedAt.length === lastClientInfo.client.sessionCountsInWeek;
  }
  private isImpossibleToFinish(table: Table): boolean {
    return table.currentClientIndex === -1;
  }

  private logPlusInfo(table: Table) {
    const clientInfosSoFar = table.clientInfos.slice(0, this.tableStepper.getMaxClientIndex() + 1);
    console.log('clientInfosSoFar', clientInfosSoFar);

    const debugInfos: Array<DebugClientInfo> = clientInfosSoFar.map((clientInfo) => ({
      sessionCount: clientInfo.client.sessionCountsInWeek,
      name: clientInfo.client.name,
      possibleIntervalRepresentations: clientInfo.possibleCellIndexes.map((cellIndex) =>
        this.primitivemapper.mapToString(table.scheduleCells[cellIndex].timeInterval),
      ),
    }));
    console.log(debugInfos);
  }
}
