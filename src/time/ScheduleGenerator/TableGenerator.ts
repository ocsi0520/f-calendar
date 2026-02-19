import { inject, Injectable } from '@angular/core';
import { ScheduleItemsGenerator } from './ScheduleItemsGenerator';
import { ClientInfo, Table } from './Table';
import { ClientService } from '../../client/client.service';
import { Client } from '../../client/Client';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class TableGenerator {
  private scheduleItemsGenerator = inject(ScheduleItemsGenerator);
  private clientService = inject(ClientService);
  public generateTable(): Table {
    return {
      clientInfos: this.getAllClientInfos(),
      currentClientIndex: 0,
      scheduleItems: this.scheduleItemsGenerator.generateAllPossibleScheduleItems(),
    };
  }
  private getAllEnabledClients(): Array<Client> {
    return this.clientService.getAllClients().filter((client) => !client.disabled);
  }
  private getAllClientInfos(): Array<ClientInfo> {
    return this.getAllEnabledClients().map((client) => ({
      client,
      joinedAt: [],
    }));
  }
}
