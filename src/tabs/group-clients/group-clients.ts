import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Client } from '../../client/Client';
import { ClientPairService } from '../../client/client-pair.service';
import { ClientService } from '../../client/client.service';

@Component({
  selector: 'app-group-clients',
  standalone: true,
  imports: [MatInputModule, MatListModule, MatButtonModule, MatCardModule],
  templateUrl: './group-clients.html',
  styleUrl: './group-clients.scss',
})
export class GroupClients implements OnInit {
  private clientService = inject(ClientService);
  private pairService = inject(ClientPairService);

  allClients = signal<Array<Client>>([]);
  selectedClient = signal<Client | null>(null);
  pairedClientsForSelected = signal<Array<Client['id']>>([]);
  selectableClientsForPair = computed<Array<Client>>(() =>
    !this.selectedClient()
      ? []
      : this.allClients().filter((client) => client.id !== this.selectedClient()!.id),
  );

  public ngOnInit(): void {
    this.refreshClients();
  }

  public refreshClients(): void {
    this.allClients.set(this.clientService.getAllClients());
  }

  public selectClient(client: Client): void {
    if (client.id === this.selectedClient()?.id) return;
    this.selectedClient.set(client);
    this.pairedClientsForSelected.set(this.pairService.getPairClientsFor(client));
  }

  public togglePair(newPair: Client): void {
    if (this.pairedClientsForSelected().includes(newPair.id))
      this.pairedClientsForSelected.set(
        this.pairedClientsForSelected().filter((client) => client !== newPair.id),
      );
    else this.pairedClientsForSelected().push(newPair.id);
  }

  public save(): void {
    const selectedClientId = this.selectedClient()!.id;
    this.pairService.removePairsByClientId(selectedClientId);
    this.pairedClientsForSelected().forEach((secondClientId) => {
      this.pairService.addPair(selectedClientId, secondClientId);
    });
    this.pairedClientsForSelected.set([]);
    this.selectedClient.set(null);
  }
}
