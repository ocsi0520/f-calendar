import { Injectable } from '@angular/core';
import { Client } from '../../../client/Client';
import { MyTimeService } from '../../../my-time.service';
import { CellIntervalsGenerator } from './CellIntervalsGenerator';
import { CellIntervalsNarrower } from './CellIntervalsNarrower';
import { TableCell } from '../../Table';
import { TimeMapper } from '../../../mappers/TimeMapper';
import { SameDayInterval } from '../../../definition/TimeInterval';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class CellGenerator {
  constructor(
    private myTimeService: MyTimeService,
    private scheduleCellIntervalsGenerator: CellIntervalsGenerator,
    private cellIntervalsNarrower: CellIntervalsNarrower,
    private timeMapper: TimeMapper,
  ) {}

  public generateAllSuitableCells(clientsInvolved: Array<Client>): Array<TableCell> {
    return this.cellIntervalsNarrower
      .getSuitableSameDayIntervals(
        this.scheduleCellIntervalsGenerator.generateAllPossibleScheduleCells(),
        clientsInvolved,
        this.myTimeService.loadSchedule(),
      )
      .map((timeInterval) => ({
        timeInterval,
        clientIdsInvolved: [],
        timeStartRepresentation: this.mapTimeIntervalToItsStartRepresentation(timeInterval),
      }));
  }

  private mapTimeIntervalToItsStartRepresentation({ dayNumber, start }: SameDayInterval): number {
    return this.timeMapper.weekTimeToNumber({ dayNumber, hour: start.hour, minute: start.minute });
  }
}
