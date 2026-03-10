import { Injectable } from '@angular/core';
import { SameDayIntervalMapper } from '../../mappers/SameDayIntervalMapper';
import { Table } from '../Table';

type DebugClientInfo = {
  sessionCount: number;
  name: string;
  possibleIntervalRepresentations: Array<string>;
};

@Injectable({ providedIn: 'root' })
export class ScheduleDebugger {
  constructor(private sameDayIntervalMapper: SameDayIntervalMapper) {}
  // TODO: public countAllPossibleVariations(table: Table): number;

  public logImpossibleTable(table: Table): void {
    const maxClientIndex = 2; // TODO: get this properly

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
}
