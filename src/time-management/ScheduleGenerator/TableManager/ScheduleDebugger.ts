import { Injectable } from '@angular/core';
import { SameDayIntervalMapper } from '../../mappers/SameDayIntervalMapper';
import { ClientInfo, Table, TableCell } from '../Table';

type DebugClientInfo = {
  sessionCount: number;
  name: string;
  possibleIntervalRepresentations: Array<string>;
};

@Injectable({ providedIn: 'root' })
export class ScheduleDebugger {
  constructor(private sameDayIntervalMapper: SameDayIntervalMapper) {}
  public countAllPossibleVariations(table: Table): number {
    return table.clientPart.clients.reduce(
      (acc, curr) => acc * this.getAllPossibilitiesForClient(table, curr),
      1,
    );
  }

  private factorialOf(n: number): number {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  private select(n: number, k: number): number {
    if (n < k) return 1;
    return this.factorialOf(n) / (this.factorialOf(k) * this.factorialOf(n - k));
  }

  private getAllPossibilitiesForClientIfAllPicked(table: Table, client: ClientInfo): number {
    const allCellsForClient = this.getAllPossibleCellsForClient(table, client);
    let currentDayNumber = allCellsForClient[0].timeInterval.dayNumber;
    let currentCount = 0; // the first is counted again
    let result = 1;
    for (const cell of allCellsForClient) {
      const cellDaynumber = cell.timeInterval.dayNumber;
      if (cellDaynumber === currentDayNumber) currentCount++;
      else {
        result *= currentCount;
        currentCount = 1;
        currentDayNumber = cellDaynumber;
      }
    }
    result *= currentCount;

    return result;
  }

  private getAllPossibilitiesForClient(table: Table, client: ClientInfo): number {
    const ifAllPicked = this.getAllPossibilitiesForClientIfAllPicked(table, client);
    return ifAllPicked * this.select(client.uniqueDays, client.client.sessionCountsInWeek);
  }

  private getAllPossibleCellsForClient(table: Table, client: ClientInfo): Array<TableCell> {
    return client.possibleCellIndexes.map((cellIndex) => table.cellPart.views.linear[cellIndex]);
  }

  public logImpossibleTable(table: Table, maxClientIndex: number): void {
    const clientInfosSoFar = table.clientPart.clients.slice(0, maxClientIndex + 1);
    console.log('clientInfosSoFar', clientInfosSoFar);

    const debugInfos: Array<DebugClientInfo> = clientInfosSoFar.map((clientInfo) => ({
      sessionCount: clientInfo.client.sessionCountsInWeek,
      name: clientInfo.client.name,
      possibleIntervalRepresentations: clientInfo.possibleCellIndexes.map((cellIndex) =>
        this.sameDayIntervalMapper.mapToString(table.cellPart.views.linear[cellIndex].timeInterval),
      ),
    }));
    console.log(debugInfos);
  }

  public getAlternativeAllCountOfVariations(table: Table): number {
    return table.clientPart.clients.reduce((acc, curr) => acc * curr.possibleCellIndexes.length, 1);
  }
}
