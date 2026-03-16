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
import { TableUtils } from './TableManager/TableUtils';
import { NoFollowingDayFor2SessionsSpecification } from './specification/rules/NoFollowingDayFor2SessionsSpecification';
import { AllowedSpecificationsService } from './specification/allowance/AllowedSpecifications.service';

@Injectable({ providedIn: 'root' })
export class SpecificationManagerFactory {
  constructor(
    private timeMapper: TimeMapper,
    private timeManager: TimeManager,
    private sameDayIntervalManager: SameDayIntervalManager,
    private pairService: ClientPairService,
    private tableUtils: TableUtils,
    private allowedSpecs: AllowedSpecificationsService,
  ) {}

  private getAllSpecifications(): Array<ScheduleSpecification> {
    const { breakfast, lunch, noFollowingDayFor2Sessions } = this.allowedSpecs.load();
    const morningChecker = new MorningChecker();
    return [
      new ProperPairsSpecification(this.pairService),
      new NoOverlappingSessionsSpecification(this.sameDayIntervalManager, this.tableUtils),
      noFollowingDayFor2Sessions
        ? new NoFollowingDayFor2SessionsSpecification(this.tableUtils)
        : null,
      breakfast
        ? new BreakfastSpecification(
            this.sameDayIntervalManager,
            this.timeManager,
            morningChecker,
            this.tableUtils,
          )
        : null,
      lunch
        ? new LunchSpecification(
            morningChecker,
            this.sameDayIntervalManager,
            this.timeManager,
            this.tableUtils,
          )
        : null,
    ].filter((rule) => rule !== null);
  }

  public create(): SpecificationManager {
    return new SpecificationManager(this.getAllSpecifications(), this.timeMapper);
  }
}
