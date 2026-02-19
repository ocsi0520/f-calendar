import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientService } from '../../client/client.service';
import { MatSelectModule } from '@angular/material/select';
import { Client } from '../../client/Client';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { WeekSchedule } from '../../time/Schedule';
import { SchedulerManager } from '../../scheduler-manager/scheduler-manager';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-management',
  imports: [MatSelectModule, MatCardModule, MatButtonModule, SchedulerManager],
  templateUrl: './client-management.html',
  styleUrl: './client-management.scss',
})
export class ClientManagement implements OnInit {
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);
  public selectedClient = signal<Client | null>(null);
  public selectClient(client: Client): void {
    this.selectedClient.set(client);
  }

  allClients = signal<Array<Client>>([]);

  public ngOnInit(): void {
    this.refreshClients();
  }

  public refreshClients(): void {
    this.allClients.set(this.clientService.getAllClients());
  }

  public handleSave(schedule: WeekSchedule): void {
    this.clientService.editScheduleForClient(this.selectedClient()!, schedule);
    const editedClient: Client = { ...this.selectedClient()!, schedule };
    this.selectedClient.set(editedClient);
    this.allClients.set(
      this.allClients().map((client) => (client.id === editedClient.id ? editedClient : client)),
    );
    this.snackBar.open(
      `${editedClient.name} client's schedule has been successfully updated ✅`,
      undefined,
      { duration: 2_000 },
    );
  }
}
