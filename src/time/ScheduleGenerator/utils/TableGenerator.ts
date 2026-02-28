import { Injectable } from '@angular/core';
import { ScheduleCellIntervalsGenerator } from './schedule-cell-generator/ScheduleCellIntervalsGenerator';
import { ClientInfo, ScheduleCell, Table } from '../Table';
import { ClientService } from '../../../client/client.service';
import { Client } from '../../../client/Client';
import { MyTimeService } from '../../../client/my-time.service';
import { ScheduleCellIntervalsNarrower } from './schedule-cell-generator/ScheduleCellIntervalsNarrower';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private scheduleCellIntervalsGenerator: ScheduleCellIntervalsGenerator,
    private clientService: ClientService,
    private myTimeService: MyTimeService,
    private cellIntervalsNarrower: ScheduleCellIntervalsNarrower,
  ) {}

  public generateTable(): Table {
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.getAllSuitablells(clientsInvolved);
    return {
      clientInfos: this.getAllClientInfosOf(clientsInvolved),
      currentClientIndex: 0,
      scheduleCells: allSuitableCells,
      currentScheduleCellIndex: 0,
    };
  }

  private getAllEnabledClients(): Array<Client> {
    return this.clientService.getAllClients().filter((client) => !client.disabled);
  }

  private getAllClientInfosOf(clientsInvolved: Array<Client>): Array<ClientInfo> {
    return clientsInvolved.map((client) => ({
      client,
      joinedAt: [],
    }));
  }

  private getAllSuitablells(clientsInvolved: Array<Client>): Array<ScheduleCell> {
    return this.cellIntervalsNarrower
      .getSuitableTimeIntervals(
        this.scheduleCellIntervalsGenerator.generateAllPossibleScheduleCells(),
        clientsInvolved,
        this.myTimeService.loadSchedule(),
      )
      .map((timeInterval) => ({ timeInterval, clientIdsInvolved: [] }));
  }
}
