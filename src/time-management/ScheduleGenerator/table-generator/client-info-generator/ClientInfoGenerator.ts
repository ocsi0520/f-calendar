import { Injectable } from '@angular/core';
import { Client } from '../../../client/Client';
import { DayNumber } from '../../../definition/time-components';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { ClientInfo, TableCell } from '../../Table';
import { ClientInfoSorter } from './ClientInfoSorter';
import { ClientInfoValidator } from './ClientInfoValidator';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ClientInfoGenerator {
  constructor(
    private readonly sameDayIntervalManager: SameDayIntervalManager,
    private readonly validator: ClientInfoValidator,
    private readonly sorter: ClientInfoSorter,
  ) {}

  public generateAllClientInfo(
    allSuitableCells: Array<TableCell>,
    allInvolvedClients: Array<Client>,
  ): Array<ClientInfo> {
    const result: Array<ClientInfo> = allInvolvedClients.map((client) =>
      this.generateInfoFromClient(allSuitableCells, client),
    );

    result.forEach(this.validator.validate.bind(this.validator));

    this.sorter.sortByRelativeChanceOfSuccess(result);
    return result;
  }

  private generateInfoFromClient(allSuitableCells: Array<TableCell>, client: Client): ClientInfo {
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
    allSuitableCells: Array<TableCell>,
    possibleCellIndexes: Array<number>,
  ): DayNumber {
    const cellsForClient = possibleCellIndexes.map((cellIndex) => allSuitableCells[cellIndex]);
    const allDayNumbersForClient = cellsForClient.map((cell) => cell.timeInterval.dayNumber);
    const uniqueDays = new Set<number>(allDayNumbersForClient);
    return uniqueDays.size as DayNumber;
  }

  private getPossibleCellindexesFor(
    allSuitableCells: Array<TableCell>,
    client: Client,
  ): Array<number> {
    return allSuitableCells
      .map((cell, indexOfCell) =>
        this.sameDayIntervalManager.isIntervalWithinSchedule(cell.timeInterval, client.schedule)
          ? indexOfCell
          : null,
      )
      .filter((index) => index !== null);
  }
}
