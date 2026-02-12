import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs'

@Component({
  selector: 'app-app-tab-selector',
  imports: [MatTabGroup, MatTab],
  templateUrl: './app-tab-selector.html',
  styleUrl: './app-tab-selector.scss',
})
export class AppTabSelector {

}
