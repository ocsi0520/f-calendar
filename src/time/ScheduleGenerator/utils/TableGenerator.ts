import { Injectable } from '@angular/core';
import { ScheduleCellIntervalsGenerator } from './ScheduleCellIntervalsGenerator';
import { ClientInfo, ScheduleCell, Table } from '../Table';
import { ClientService } from '../../../client/client.service';
import { Client } from '../../../client/Client';
import { MyTimeService } from '../../../client/my-time.service';
import { ScheduleCellsNarrower } from './ScheduleCellsNarrower';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private scheduleCellIntervalsGenerator: ScheduleCellIntervalsGenerator,
    private clientService: ClientService,
    private myTimeService: MyTimeService,
    private cellsNarrower: ScheduleCellsNarrower,
  ) {}

  public generateTable(): Table {
    const allPossibleCells = this.getAllPossibleCells();
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.cellsNarrower.getSuitableCells(
      allPossibleCells,
      clientsInvolved,
      this.myTimeService.loadSchedule(),
    );
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

  private getAllPossibleCells(): Array<ScheduleCell> {
    return this.scheduleCellIntervalsGenerator
      .generateAllPossibleScheduleCells()
      .map((timeInterval) => ({
        timeInterval,
        clientIdsInvolved: [],
      }));
  }
}
