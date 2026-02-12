import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { AppMyTime } from '../app-my-time/app-my-time';

@Component({
  selector: 'app-tab-selector',
  imports: [MatTabGroup, MatTab, AppMyTime],
  templateUrl: './app-tab-selector.html',
  styleUrl: './app-tab-selector.scss',
})
export class AppTabSelector {}
