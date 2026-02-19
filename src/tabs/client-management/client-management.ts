import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientService } from '../../client/client.service';
import { MatSelectModule } from '@angular/material/select';
import { Client } from '../../client/Client';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AppCalendar } from '../../calendar/app-calendar';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-management',
  imports: [MatSelectModule, MatCardModule, MatButtonModule, AppCalendar],
  templateUrl: './client-management.html',
  styleUrl: './client-management.scss',
})
export class ClientManagement implements OnInit {
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  public allClients = signal<Array<Client>>([]);

  public selectedClient = signal<Client | null>(null);
  private backupClient: Client | null = null;

  public selectClient(client: Client): void {
    this.backupClient = structuredClone(client);
    this.selectedClient.set(client);
  }

  public ngOnInit(): void {
    this.refreshClients();
  }

  public refreshClients(): void {
    this.allClients.set(this.clientService.getAllClients());
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
}
