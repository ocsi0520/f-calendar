import { Injectable } from '@angular/core';
import { WeekSchedule } from '../../Schedule';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';
import { ScheduleCell } from '../Table';
import { Client } from '../../../client/Client';
import { groupBy } from '../../../utils/groupby';
import { TimeIntervalDeduplicator } from './TimeIntervalDeduplicator';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

// TODO: refactor, and make ScheduleCellsGenerator TimeIntervalGenerator
// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ScheduleCellsNarrower {
  constructor(
    private timeIntervalManager: TimeIntervalManager,
    private deduplicator: TimeIntervalDeduplicator,
    private timeIntervalPrimitiveMapper: TimeIntervalPrimitiveMapper,
  ) {}

  public getSuitableCells(
    allPossibleCells: Array<ScheduleCell>,
    clientsInvolved: Array<Client>,
    myTime: WeekSchedule,
  ): Array<ScheduleCell> {
    const cellsForMe = this.getAllPossibleCellsForMe(allPossibleCells, myTime);
    const cellsToMakeUnique: Array<ScheduleCell> = [];
    for (let client of clientsInvolved) {
      const possibleCellsForClient = this.getAllPossibleCellsForClient(cellsForMe, client);
      this.validateClientCells(client, possibleCellsForClient);
      cellsToMakeUnique.push(...possibleCellsForClient);
    }
    return this.makeCellsUnique(cellsToMakeUnique);
  }

  private getAllPossibleCellsForMe(
    cells: Array<ScheduleCell>,
    myTime: WeekSchedule,
  ): Array<ScheduleCell> {
    return cells.filter((cell) => this.withinSchedule(cell, myTime));
  }

  private getAllPossibleCellsForClient(
    cellsSuitableForMe: Array<ScheduleCell>,
    client: Client,
  ): Array<ScheduleCell> {
    return cellsSuitableForMe.filter((cell) => this.withinSchedule(cell, client.schedule));
  }

  private withinSchedule(cell: ScheduleCell, schedule: WeekSchedule): boolean {
    return this.timeIntervalManager.isIntervalWithinSchedule(cell.timeInterval, schedule);
  }

  private validateClientCells(client: Client, possibleCellsForClient: ScheduleCell[]): void {
    const clientCellsGroupedByDay = groupBy(
      possibleCellsForClient,
      (cell) => cell.timeInterval.dayNumber,
    );
    const dayNumberWithPossibleSessions = Object.keys(clientCellsGroupedByDay);
    const hasDayForAllNeededSessions =
      dayNumberWithPossibleSessions.length >= client.sessionCountsInWeek;
    if (!hasDayForAllNeededSessions)
      throw new Error(
        `not enough cells for client: (${client.id}) ${client.name}; valid dayNumbers are: ${dayNumberWithPossibleSessions.join()}; needed session count: ${client.sessionCountsInWeek}`,
      );
  }

  private makeCellsUnique(cells: Array<ScheduleCell>): Array<ScheduleCell> {
    const deDuplicatedCells: Array<ScheduleCell> = this.deduplicator
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
