import { Component } from '@angular/core';
import { AppTabSelector } from '../tabs/app-tab-selector/app-tab-selector';

@Component({
  selector: 'app-root',
  imports: [AppTabSelector],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
