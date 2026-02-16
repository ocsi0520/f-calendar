import { inject, Injectable } from '@angular/core';
import { Client } from './Client';
import { WeekSchedule } from '../time/Schedule';
import { TimeIntervalMapper } from '../time/TimeInterval/TimeIntervalMapper';

type ScheduleSerializedClient = Omit<Client, 'schedule'> & { schedule: string[] };

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  // currently working w/ local storage, later on we can move on to a proper BE call
  private static CLIENT_KEY = 'calendar_clients';
  private static CLIENT_ID_KEY = 'calendar_clients_id';
  private mapper = inject(TimeIntervalMapper);

  public addClient(newClient: Omit<Client, 'id'>): void {
    const allClients = this.getAllClients();
    const newId = this.generateNextId();
    this.saveLastId(newId);
    allClients.push({ ...newClient, id: newId });
    this.saveAll(allClients);
  }

  private generateNextId(): number {
    return Number(localStorage.getItem(ClientService.CLIENT_ID_KEY) || '0') + 1;
  }
  private saveLastId(lastId: number): void {
    localStorage.setItem(ClientService.CLIENT_ID_KEY, lastId.toString());
  }

  public getAllClients(): Array<Client> {
    const halfDeserialized: Array<ScheduleSerializedClient> = JSON.parse(
      localStorage.getItem(ClientService.CLIENT_KEY) || '[]',
    );
    const clients: Array<Client> = halfDeserialized.map((item) => {
      const deserializedSchedule = item.schedule.map((timeIntervalString) =>
        this.mapper.mapFromString(timeIntervalString),
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
    newSchedule.sort((a, b) => {
      return this.mapper.mapToString(a).localeCompare(this.mapper.mapToString(b));
    });
    this.editClient({ ...client, schedule: newSchedule });
  }

  private saveAll(allClients: Array<Client>): void {
    const halfSerialized: Array<ScheduleSerializedClient> = allClients.map((client) => ({
      ...client,
      schedule: client.schedule.map((timeInterval) => this.mapper.mapToString(timeInterval)),
    }));
    localStorage.setItem(ClientService.CLIENT_KEY, JSON.stringify(halfSerialized));
  }
}
