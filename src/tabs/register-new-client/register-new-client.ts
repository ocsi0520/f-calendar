import { Component, inject } from '@angular/core';
import { ClientService } from '../../client/client.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Client } from '../../client/Client';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-new-client',
  standalone: true,
  imports: [
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './register-new-client.html',
  styleUrl: './register-new-client.scss',
})
export class RegisterNewClient {
  clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    sessionCountsInWeek: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
    comment: [''],
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const newClient = this.form.getRawValue() as Omit<Client, 'schedule'>;
    this.clientService.addClient({ ...newClient, schedule: [] });
    this.form.reset();
    this.snackBar.open(`${newClient.name} client has been successfully registered✅`, undefined, {
      duration: 2_000,
    });
  }

  // convenience getters for template
  get name() {
    return this.form.controls.name;
  }
  get sessions() {
    return this.form.controls.sessionCountsInWeek;
  }
  get comment() {
    return this.form.controls.comment;
  }
}
