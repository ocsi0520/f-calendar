import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientService } from '../../client/client.service';
import { MatSelectModule } from '@angular/material/select';
import { Client } from '../../client/Client';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../time-management/calendar/app-calendar/app-calendar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientFieldsEditor } from './client-fields-editor/client-fields-editor';
import { FormsModule } from '@angular/forms';
import { ClientPairService } from '../../client/client-pair.service';

@Component({
  selector: 'app-client-management',
  imports: [
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    AppCalendar,
    ClientFieldsEditor,
    FormsModule,
  ],
  templateUrl: './client-management.html',
  styleUrl: './client-management.scss',
})
export class ClientManagement implements OnInit {
  private clientService = inject(ClientService);
  private pairService = inject(ClientPairService);
  private snackBar = inject(MatSnackBar);

  public allClients = signal<Array<Client>>([]);

  public selectedClient = signal<Client | null>(null);
  private backupClient: Client | null = null;

  public selectClient(client: Client): void {
    this.backupClient = structuredClone(client);
    this.selectedClient.set(structuredClone(client));
  }

  public ngOnInit(): void {
    this.refreshClients();
  }

  public refreshClients(): void {
    const allClients = this.clientService.getAllClients();
    allClients.sort((c1, c2) => c1.name.localeCompare(c2.name));
    this.allClients.set(allClients);
  }

  public reset(): void {
    this.selectedClient.set(structuredClone(this.backupClient));
  }

  public save(): void {
    const editedClient = this.selectedClient()!;
    this.clientService.editClient(editedClient);
    this.refreshClients();
    this.backupClient = structuredClone(editedClient);
    this.snackBar.open(
      `${editedClient.name} client's schedule has been successfully updated ✅`,
      undefined,
      { duration: 2_000 },
    );
  }

  public remove(): void {
    const clientToBeDeleted = this.backupClient!;
    const isConfirmed = confirm(
      `Are you sure you want to delete '${clientToBeDeleted.name}' client`,
    );
    if (!isConfirmed) return;

    this.pairService.removePairsByClientId(clientToBeDeleted.id);
    this.clientService.deleteClient(clientToBeDeleted);
    this.backupClient = null;
    this.selectedClient.set(null);
    this.refreshClients();

    this.snackBar.open(
      `'${clientToBeDeleted.name}' client has been succesfully removed 🗑️`,
      undefined,
      { duration: 2_000 },
    );
  }
}
