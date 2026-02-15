import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Client } from '../../client/Client';
import { ClientPairService } from '../../client/client-pair.service';
import { ClientService } from '../../client/client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private snackBar = inject(MatSnackBar);

  public allClients = signal<Array<Client>>([]);
  public selectedClient = signal<Client | null>(null);
  public pairedClientsForSelected = signal<Array<Client['id']>>([]);
  public selectableClientsForPair = computed<Array<Client>>(() =>
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
    const selectedClientForPair = this.selectedClient()!;
    this.pairService.removePairsByClientId(selectedClientForPair.id);
    this.pairedClientsForSelected().forEach((secondClientId) => {
      this.pairService.addPair(selectedClientForPair.id, secondClientId);
    });
    this.pairedClientsForSelected.set([]);
    this.selectedClient.set(null);
    this.snackBar.open(
      `${selectedClientForPair.name} client's pairs has been succesfully updated✅`,
      undefined,
      { duration: 2_000 },
    );
  }
}
