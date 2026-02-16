import { inject, Injectable } from '@angular/core';
import { Client } from './Client';
import { WeekSchedule } from '../time/Schedule';
import { TimeIntervalFactory } from '../time/TimeInterval/TimeIntervalFactory';

type ScheduleSerializedClient = Omit<Client, 'schedule'> & { schedule: string[] };

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  // currently working w/ local storage, later on we can move on to a proper BE call
  private static CLIENT_KEY = 'calendar_clients';
  private timeIntervalFactory = inject(TimeIntervalFactory);

  public addClient(newClient: Omit<Client, 'id'>): void {
    const allClients = this.getAllClients();
    allClients.push({ ...newClient, id: this.generateIdFrom(allClients) });
    this.saveAll(allClients);
  }

  private generateIdFrom(allClients: Array<Client>): number {
    const lastId = allClients.reduce(
      (maxId, client) => (client.id > maxId ? client.id : maxId),
      -Infinity,
    );
    return lastId === -Infinity ? 1 : lastId + 1;
  }

  public getAllClients(): Array<Client> {
    const halfDeserialized: Array<ScheduleSerializedClient> = JSON.parse(
      localStorage.getItem(ClientService.CLIENT_KEY) || '[]',
    );
    const clients: Array<Client> = halfDeserialized.map((item) => {
      const deserializedSchedule = item.schedule.map((timeIntervalString) =>
        this.timeIntervalFactory.createOf(timeIntervalString),
      );
      return { ...item, schedule: deserializedSchedule };
    });
    return clients;
  }

  public deleteClient(toBeDeleted: Client): void {
    this.saveAll(this.getAllClients().filter((client) => client.id !== toBeDeleted.id));
  }

  public editClient(editedClient: Client): void {
    const allClients = this.getAllClients();
    const editedAllClients = allClients.map((client) =>
      client.id !== editedClient.id ? client : editedClient,
    );
    this.saveAll(editedAllClients);
  }

  public editScheduleForClient(client: Client, newSchedule: WeekSchedule): void {
    newSchedule.sort((a, b) => a.toString().localeCompare(b.toString()));
    this.editClient({ ...client, schedule: newSchedule });
  }

  private saveAll(allClients: Array<Client>): void {
    const halfSerialized: Array<ScheduleSerializedClient> = allClients.map((client) => ({
      ...client,
      schedule: client.schedule.map((timeInterval) => timeInterval.toString()),
    }));
    localStorage.setItem(ClientService.CLIENT_KEY, JSON.stringify(halfSerialized));
  }
}
