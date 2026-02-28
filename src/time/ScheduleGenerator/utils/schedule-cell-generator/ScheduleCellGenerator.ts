import { Injectable } from '@angular/core';
import { Client } from '../../../../client/Client';
import { MyTimeService } from '../../../../client/my-time.service';
import { ScheduleCell } from '../../Table';
import { ScheduleCellIntervalsGenerator } from './ScheduleCellIntervalsGenerator';
import { ScheduleCellIntervalsNarrower } from './ScheduleCellIntervalsNarrower';

// TODO: test
@Injectable({
  providedIn: 'root',
})
export class ScheduleCellGenerator {
  constructor(
    private myTimeService: MyTimeService,
    private scheduleCellIntervalsGenerator: ScheduleCellIntervalsGenerator,
    private cellIntervalsNarrower: ScheduleCellIntervalsNarrower,
  ) {}

  public generateAllSuitableCells(clientsInvolved: Array<Client>): Array<ScheduleCell> {
    return this.cellIntervalsNarrower
      .getSuitableTimeIntervals(
        this.scheduleCellIntervalsGenerator.generateAllPossibleScheduleCells(),
        clientsInvolved,
        this.myTimeService.loadSchedule(),
      )
      .map((timeInterval) => ({ timeInterval, clientIdsInvolved: [] }));
  }
}
