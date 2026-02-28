import { Injectable } from '@angular/core';
import { ClientInfo, Table } from '../Table';
import { ClientService } from '../../../client/client.service';
import { Client } from '../../../client/Client';
import { ScheduleCellGenerator } from './schedule-cell-generator/ScheduleCellGenerator';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private clientService: ClientService,
    private cellGenerator: ScheduleCellGenerator,
  ) {}

  public generateTable(): Table {
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.cellGenerator.generateAllSuitableCells(clientsInvolved);
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
}
