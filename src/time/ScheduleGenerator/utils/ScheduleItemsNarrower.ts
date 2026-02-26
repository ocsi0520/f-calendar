import { Injectable } from '@angular/core';
import { WeekSchedule } from '../../Schedule';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { ScheduleItem } from '../Table';
import { Client } from '../../../client/Client';
import { groupBy } from '../../../utils/groupby';
import { TimeIntervalDeduplicator } from './TimeIntervalDeduplicator';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

// TODO: refactor, and make ScheduleItemsGenerator TimeIntervalGenerator
// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ScheduleItemsNarrower {
  constructor(
    private timeIntervalManager: TimeIntervalManager,
    private deduplicator: TimeIntervalDeduplicator,
    private timeIntervalPrimitiveMapper: TimeIntervalPrimitiveMapper,
  ) {}

  public getSuitableCells(
    allPossibleCells: Array<ScheduleItem>,
    clientsInvolved: Array<Client>,
    myTime: WeekSchedule,
  ): Array<ScheduleItem> {
    const cellsForMe = this.getAllPossibleCellsForMe(allPossibleCells, myTime);
    const cellsToMakeUnique: Array<ScheduleItem> = [];
    for (let client of clientsInvolved) {
      const possibleCellsForClient = this.getAllPossibleCellsForClient(cellsForMe, client);
      this.validateClientCells(client, possibleCellsForClient);
      cellsToMakeUnique.push(...possibleCellsForClient);
    }
    return this.makeCellsUnique(cellsToMakeUnique);
  }

  private getAllPossibleCellsForMe(
    cells: Array<ScheduleItem>,
    myTime: WeekSchedule,
  ): Array<ScheduleItem> {
    return cells.filter((cell) => this.withinSchedule(cell, myTime));
  }

  private getAllPossibleCellsForClient(
    cellsSuitableForMe: Array<ScheduleItem>,
    client: Client,
  ): Array<ScheduleItem> {
    return cellsSuitableForMe.filter((cell) => this.withinSchedule(cell, client.schedule));
  }

  private withinSchedule(item: ScheduleItem, schedule: WeekSchedule): boolean {
    return this.timeIntervalManager.isIntervalWithinSchedule(item.timeInterval, schedule);
  }

  private validateClientCells(client: Client, possibleCellsForClient: ScheduleItem[]): void {
    const clientCellsGroupedByDay = groupBy(
      possibleCellsForClient,
      (item) => item.timeInterval.dayNumber,
    );
    const dayNumberWithPossibleSessions = Object.keys(clientCellsGroupedByDay);
    const hasDayForAllNeededSessions =
      dayNumberWithPossibleSessions.length >= client.sessionCountsInWeek;
    if (!hasDayForAllNeededSessions)
      throw new Error(
        `not enough cells for client: (${client.id}) ${client.name}; valid dayNumbers are: ${dayNumberWithPossibleSessions.join()}; needed session count: ${client.sessionCountsInWeek}`,
      );
  }

  private makeCellsUnique(cells: Array<ScheduleItem>): Array<ScheduleItem> {
    const deDuplicatedCells: Array<ScheduleItem> = this.deduplicator
      .deDuplicate(cells.map((cell) => cell.timeInterval))
      .map((timeInterval) => ({
        timeInterval,
        clientIdsInvolved: [],
      }));
    deDuplicatedCells.sort(
      (a, b) =>
        this.timeIntervalPrimitiveMapper.mapToNumber(a.timeInterval) -
        this.timeIntervalPrimitiveMapper.mapToNumber(b.timeInterval),
    );
    return deDuplicatedCells;
  }
}
