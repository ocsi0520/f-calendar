import { inject, Injectable } from '@angular/core';
import { ScheduleSpecification } from './specification/specification';
import { AvailableForClientsSpecification } from './specification/AvailableForClientsSpecification';
import { TimeIntervalManager } from '../TimeInterval/TimeIntervalManager';
import { AvailableForMe } from './specification/AvailableForMeSpecification';
import { MyTimeService } from '../../client/my-time.service';
import { BreakfastSpecification } from './specification/BreakfastSpecification';
import { TimeManager } from '../TimeManager';
import { MorningChecker } from './specification/MorningChecker';
import { LunchSpecification } from './specification/LunchSpecification';
import { NoOverlappingSessionsSpecification } from './specification/NoOverlappingSessionsSpecification';
import { NoSameDayForSameClientSpecification } from './specification/NoSameDayForSameClientSpecification';
import { ProperPairsSpecification } from './specification/ProperPairsSpecification';
import { ClientPairService } from '../../client/client-pair.service';
import { Table } from './Table';
import { TableGenerator } from './TableGenerator';
import { DisplayableSchedule } from '../Schedule';
import { TableStepper } from './TableStepper';
import { TableMapper } from './TableMapper';

// TODO: test
@Injectable({ providedIn: 'root' })
export class ScheduleGenerator {
  private timeIntervalManager = inject(TimeIntervalManager);
  private myTimeService = inject(MyTimeService);
  private timeManager = inject(TimeManager);
  private pairService = inject(ClientPairService);
  private tableGenerator = inject(TableGenerator);
  private tableStepper = inject(TableStepper);
  private tableMapper = inject(TableMapper);

  private getAllSpecifications(): Array<ScheduleSpecification> {
    const morningChecker = new MorningChecker(this.timeManager);
    return [
      new AvailableForClientsSpecification(this.timeIntervalManager),
      new AvailableForMe(this.myTimeService, this.timeIntervalManager),
      new BreakfastSpecification(this.timeManager, morningChecker),
      new LunchSpecification(morningChecker, this.timeIntervalManager),
      new NoOverlappingSessionsSpecification(this.timeIntervalManager),
      new NoSameDayForSameClientSpecification(),
      new ProperPairsSpecification(this.pairService),
    ];
  }

  public generateSchedule(): DisplayableSchedule {
    const finishedTable = this.generateFinishedTable();
    return this.tableMapper.mapToSchedule(finishedTable);
  }

  private generateFinishedTable(): Table {
    const allSpecifications = this.getAllSpecifications();
    const table = this.tableGenerator.generateTable();
    while (!this.isTableDone(table) || !this.isImpossibleToFinish(table)) {
      this.tableStepper.step(table, allSpecifications);
    }
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
