import { Injectable } from '@angular/core';
import { ClientInfo, Table } from '../Table';
import { ClientService } from '../../../client/client.service';
import { Client } from '../../../client/Client';
import { ScheduleCellGenerator } from './schedule-cell-generator/ScheduleCellGenerator';
import { ClientInfoGenerator } from './client-info/ClientInfoGenerator';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private clientService: ClientService,
    private cellGenerator: ScheduleCellGenerator,
    private clientInfoGenerator: ClientInfoGenerator,
  ) {}

  public generateTable(): Table {
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.cellGenerator.generateAllSuitableCells(clientsInvolved);
    return {
      clientInfos: this.clientInfoGenerator.generateAllClientInfo(
        allSuitableCells,
        clientsInvolved,
      ),
      currentClientIndex: 0,
      scheduleCells: allSuitableCells,
      currentScheduleCellIndex: 0,
    };
  }

  private getAllEnabledClients(): Array<Client> {
    return this.clientService.getAllClients().filter((client) => !client.disabled);
  }
}
