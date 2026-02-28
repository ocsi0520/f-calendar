import { Injectable } from '@angular/core';
import { ClientInfo, ScheduleCell } from '../../Table';
import { Client } from '../../../../client/Client';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ClientInfoValidator } from './ClientInfoValidator';
import { ClientInfoSorter } from './ClientInfoSorter';
import { DayNumber } from '../../../TimeInterval/TimeInterval-constants';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ClientInfoGenerator {
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly validator: ClientInfoValidator,
    private readonly sorter: ClientInfoSorter,
  ) {}

  public generateAllClientInfo(
    allSuitableCells: Array<ScheduleCell>,
    allInvolvedClients: Array<Client>,
  ): Array<ClientInfo> {
    const result: Array<ClientInfo> = allInvolvedClients.map((client) =>
      this.generateInfoFromClient(allSuitableCells, client),
    );

    result.forEach(this.validator.validate.bind(this.validator));

    this.sorter.sortByRelativeChanceOfSuccess(result);
    return result;
  }

  private generateInfoFromClient(
    allSuitableCells: Array<ScheduleCell>,
    client: Client,
  ): ClientInfo {
    const possibleCellIndexes = this.getPossibleCellindexesFor(allSuitableCells, client);

    return {
      client,
      joinedAt: [],
      currentIndexOfPossibleCells: 0,
      possibleCellIndexes,
      uniqueDays: this.getUniqueDays(allSuitableCells, possibleCellIndexes),
    };
  }

  private getUniqueDays(
    allSuitableCells: Array<ScheduleCell>,
    possibleCellIndexes: Array<number>,
  ): DayNumber {
    const cellsForClient = possibleCellIndexes.map((cellIndex) => allSuitableCells[cellIndex]);
    const allDayNumbersForClient = cellsForClient.map((cell) => cell.timeInterval.dayNumber);
    const uniqueDays = new Set<number>(allDayNumbersForClient);
    return uniqueDays.size as DayNumber;
  }

  private getPossibleCellindexesFor(
    allSuitableCells: ScheduleCell[],
    client: Client,
  ): Array<number> {
    return allSuitableCells
      .map((cell, indexOfCell) =>
        this.timeIntervalManager.isIntervalWithinSchedule(cell.timeInterval, client.schedule)
          ? indexOfCell
          : null,
      )
      .filter((index) => index !== null);
  }
}
