import { Injectable } from '@angular/core';
import { ClientPairService } from '../client/client-pair.service';
import { TimeManager } from '../managers/TimeManager';
import { BreakfastSpecification } from './specification/rules/BreakfastSpecification';
import { LunchSpecification } from './specification/rules/LunchSpecification';
import { MorningChecker } from './specification/rules/MorningChecker';
import { NoOverlappingSessionsSpecification } from './specification/rules/NoOverlappingSessionsSpecification';
import { ProperPairsSpecification } from './specification/rules/ProperPairsSpecification';
import { ScheduleSpecification } from './specification/specification';
import { SpecificationManager } from './specification/SpecificationManager';
import { SameDayIntervalManager } from '../managers/SameDayIntervalManager';
import { TimeMapper } from '../mappers/TimeMapper';

@Injectable({ providedIn: 'root' })
export class SpecificationManagerFactory {
  constructor(
    private timeMapper: TimeMapper,
    private timeManager: TimeManager,
    private sameDayIntervalManager: SameDayIntervalManager,
    private pairService: ClientPairService,
  ) {}

  private getAllSpecifications(): Array<ScheduleSpecification> {
    const morningChecker = new MorningChecker();
    return [
      new NoOverlappingSessionsSpecification(this.sameDayIntervalManager),
      new ProperPairsSpecification(this.pairService),
      new BreakfastSpecification(this.sameDayIntervalManager, this.timeManager, morningChecker),
      new LunchSpecification(morningChecker, this.sameDayIntervalManager, this.timeManager),
    ];
  }

  public create(): SpecificationManager {
    return new SpecificationManager(this.getAllSpecifications(), this.timeMapper);
  }
}
