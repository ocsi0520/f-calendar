import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { AppMyTime } from '../app-my-time/app-my-time';
import { RegisterNewClient } from "../register-new-client/register-new-client";
import { GroupClients } from "../group-clients/group-clients";

@Component({
  selector: 'app-tab-selector',
  imports: [MatTabGroup, MatTab, AppMyTime, RegisterNewClient, GroupClients],
  templateUrl: './app-tab-selector.html',
  styleUrl: './app-tab-selector.scss',
})
export class AppTabSelector {}
