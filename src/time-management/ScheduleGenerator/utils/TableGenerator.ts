import { Injectable } from '@angular/core';
import { Client } from '../../client/Client';
import { ClientService } from '../../client/client.service';
import { Table } from '../Table';
import { CellGenerator } from './cell-generator/CellGenerator';
import { ClientInfoGenerator } from './client-info-generator/ClientInfoGenerator';
import { TableViewGenerator } from './TableViewGenerator';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private clientService: ClientService,
    private cellGenerator: CellGenerator,
    private clientInfoGenerator: ClientInfoGenerator,
    private viewGenerator: TableViewGenerator,
  ) {}

  public generateTable(): Table {
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.cellGenerator.generateAllSuitableCells(clientsInvolved);
    return {
      cellPart: {
        views: this.viewGenerator.generateViewsFrom(allSuitableCells),
      },
      clientPart: {
        currentClientIndex: 0,
        clients: this.clientInfoGenerator.generateAllClientInfo(allSuitableCells, clientsInvolved),
      },
    };
  }

  private getAllEnabledClients(): Array<Client> {
    return this.clientService.getAllClients().filter((client) => !client.disabled);
  }
}
