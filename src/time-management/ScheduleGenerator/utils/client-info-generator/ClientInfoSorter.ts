import { Injectable } from '@angular/core';
import { ClientInfo } from '../../Table';

@Injectable({ providedIn: 'root' })
export class ClientInfoSorter {
  public sortByRelativeChanceOfSuccess(clientInfos: Array<ClientInfo>): void {
    clientInfos.sort(this.compare.bind(this));
  }

  // rookie thing, but I'll keep this here as commented
  private compare(info1: ClientInfo, info2: ClientInfo): number {
    // if (info1.uniqueDays !== info2.uniqueDays) return info1.uniqueDays - info2.uniqueDays;

    // return info1.possibleCellIndexes.length - info2.possibleCellIndexes.length;

    const diff = this.getRelativeChance(info1) - this.getRelativeChance(info2);
    return diff || info1.uniqueDays - info2.uniqueDays;
  }

  private getRelativeChance(clientInfo: ClientInfo): number {
    return clientInfo.possibleCellIndexes.length / clientInfo.uniqueDays;
  }
}
