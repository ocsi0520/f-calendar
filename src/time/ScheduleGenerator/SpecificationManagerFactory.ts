import { Injectable } from '@angular/core';
import { SpecificationManager } from './specification/SpecificationManager';
import { ClientPairService } from '../../client/client-pair.service';
import { MyTimeService } from '../../client/my-time.service';
import { TimeIntervalManager } from '../TimeInterval/TimeIntervalManager';
import { TimeManager } from '../TimeManager';
import { AvailableForClientsSpecification } from './specification/rules/AvailableForClientsSpecification';
import { BreakfastSpecification } from './specification/rules/BreakfastSpecification';
import { LunchSpecification } from './specification/rules/LunchSpecification';
import { MorningChecker } from './specification/rules/MorningChecker';
import { NoOverlappingSessionsSpecification } from './specification/rules/NoOverlappingSessionsSpecification';
import { ProperPairsSpecification } from './specification/rules/ProperPairsSpecification';
import { ScheduleSpecification } from './specification/specification';

@Injectable({ providedIn: 'root' })
export class SpecificationManagerFactory {
  constructor(
    private timeIntervalManager: TimeIntervalManager,
    private myTimeService: MyTimeService,
    private timeManager: TimeManager,
    private pairService: ClientPairService,
  ) {}
  private getAllSpecifications(): Array<ScheduleSpecification> {
    const morningChecker = new MorningChecker(this.timeManager);
    return [
      new AvailableForClientsSpecification(this.timeIntervalManager),
      // unnecessary because of narrower
      // new AvailableForMe(this.myTimeService, this.timeIntervalManager),
      new BreakfastSpecification(this.timeIntervalManager, morningChecker),
      new LunchSpecification(morningChecker, this.timeIntervalManager),
      new NoOverlappingSessionsSpecification(this.timeIntervalManager),
      // unnecessary because of optimization in TableStepper
      // new NoSameDayForSameClientSpecification(),
      new ProperPairsSpecification(this.pairService, this.timeIntervalManager),
    ];
  }

  public create(): SpecificationManager {
    return new SpecificationManager(this.timeIntervalManager, this.getAllSpecifications());
  }
}
