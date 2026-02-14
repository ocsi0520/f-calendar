import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { AppMyTime } from '../app-my-time/app-my-time';
import { RegisterNewClient } from '../register-new-client/register-new-client';
import { GroupClients } from '../group-clients/group-clients';
import { OthersTime } from '../others-time/others-time';
import { AppGenerateWeekSchedule } from '../app-generate-week-schedule/app-generate-week-schedule';

// TODO:
// as mat-tab-selector retains everything in the DOM (so if I switch to another tab, the prev tab's content is not removed from the DOM)
// this should be a smart-component OR each component should have a separate state-manager instance-level service which synchronizes with
// the root services; the first one is a simpler/concise solution
@Component({
  selector: 'app-tab-selector',
  imports: [
    MatTabGroup,
    MatTab,
    AppMyTime,
    RegisterNewClient,
    GroupClients,
    OthersTime,
    AppGenerateWeekSchedule,
  ],
  templateUrl: './app-tab-selector.html',
  styleUrl: './app-tab-selector.scss',
})
export class AppTabSelector {}
