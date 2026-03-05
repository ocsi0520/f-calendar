import { Component, input, output } from '@angular/core';
import { Client } from '../../../time-management/client/Client';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-client-fields-editor',
  imports: [FormsModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './client-fields-editor.html',
  styleUrl: './client-fields-editor.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class ClientFieldsEditor {
  public client = input.required<Client>();
  public clientChange = output<Client>();
}
