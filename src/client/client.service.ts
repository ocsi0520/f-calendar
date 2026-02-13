import { Injectable } from '@angular/core';
import { Client } from './Client';

// TODO: later on, we might edit
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  // currently working w/ local storage, later on we can move on to a proper BE call
  private static CLIENT_KEY = 'calendar_clients';

  public addClient(newClient: Client): void {
    const allClients = this.getAllClients();
    allClients.push({ ...newClient, id: this.generateIdFrom(allClients) });
    this.saveAll(allClients);
  }

  private generateIdFrom(allClients: Array<Client>): number {
    return (
      allClients.reduce((maxId, client) => (client.id > maxId ? client.id : maxId), -Infinity) + 1
    );
  }

  public getAllClients(): Array<Client> {
    return JSON.parse(localStorage.getItem(ClientService.CLIENT_KEY) || '[]');
  }

  public deleteClient(toBeDeleted: Client): void {
    this.saveAll(this.getAllClients().filter((client) => client.id !== toBeDeleted.id));
  }

  private saveAll(allClients: Array<Client>): void {
    localStorage.setItem(ClientService.CLIENT_KEY, JSON.stringify(allClients));
  }
}
