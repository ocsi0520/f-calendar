import { Injectable } from '@angular/core';
import { ScheduleItemsGenerator } from './ScheduleItemsGenerator';
import { ClientInfo, Table } from '../Table';
import { ClientService } from '../../../client/client.service';
import { Client } from '../../../client/Client';
import { MyTimeService } from '../../../client/my-time.service';
import { ScheduleItemsNarrower } from './ScheduleItemsNarrower';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  constructor(
    private scheduleItemsGenerator: ScheduleItemsGenerator,
    private clientService: ClientService,
    private myTimeService: MyTimeService,
    private itemsNarrower: ScheduleItemsNarrower,
  ) {}

  public generateTable(): Table {
    const allPossibleCells = this.scheduleItemsGenerator.generateAllPossibleScheduleItems();
    const clientsInvolved = this.getAllEnabledClients();
    const allSuitableCells = this.itemsNarrower.getSuitableCells(
      allPossibleCells,
      clientsInvolved,
      this.myTimeService.loadSchedule(),
    );
    return {
      clientInfos: this.getAllClientInfosOf(clientsInvolved),
      currentClientIndex: 0,
      scheduleItems: allSuitableCells,
      currentScheduleItemIndex: 0,
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
