import { Client } from '../../client/Client';
import { WeekSchedule } from '../Schedule';
import { isSameInterval } from '../TimeInterval/TimeInterval';
import { SessionCell } from './SessionCell';
import { SessionCellGenerator } from './SessionCellGenerator';

// TODO: better name
export class AvailabilityChecker {
  constructor(private sessionCellGenerator: SessionCellGenerator) {}

  public getAllPossibleSessionCellsForClient(
    mySchedule: WeekSchedule,
    client: Client,
  ): Array<SessionCell> {
    const allAvailableCellsForMe = mySchedule
      .map((timeSlot) => this.sessionCellGenerator.generateAllPossibleCellsWith(timeSlot))
      .flat(1);

    const allAvailableCellsForClient = client.schedule
      .map((timeSlot) => this.sessionCellGenerator.generateAllPossibleCellsWith(timeSlot))
      .flat(1);

    return this.getAvailableMyCellsForClient(allAvailableCellsForMe, allAvailableCellsForClient);
  }

  private getAvailableMyCellsForClient(
    myCells: Array<SessionCell>,
    clientCells: Array<SessionCell>,
  ): Array<SessionCell> {
    return myCells.filter((myCell) =>
      clientCells.some((clientCell) =>
        isSameInterval(clientCell.timeInterval, myCell.timeInterval),
      ),
    );
  }
}
