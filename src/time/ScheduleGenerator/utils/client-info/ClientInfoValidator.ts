import { Injectable } from '@angular/core';
import { ClientInfo } from '../../Table';

// TODO: test
@Injectable({ providedIn: 'root' })
export class ClientInfoValidator {
  public validate(clientInfo: ClientInfo): void {
    if (clientInfo.uniqueDays < clientInfo.client.sessionCountsInWeek)
      throw new Error(
        `'${clientInfo.client.name}' client has less possible session days than` +
          ` needed sessions per week (${clientInfo.client.sessionCountsInWeek})`,
      );
  }
}
