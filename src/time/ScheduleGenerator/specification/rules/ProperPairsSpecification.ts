import { ClientPairService } from '../../../../client/client-pair.service';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(
    private readonly pairService: ClientPairService,
    private readonly timeIntervalManager: TimeIntervalManager,
  ) {}
  public check(
    _table: Table,
    _cellsOnSameDay: Array<ScheduleItem>,
    currentCell: ScheduleItem,
  ): Result {
    const { clientIdsInvolved } = currentCell;
    if (clientIdsInvolved.length < 2) return this.getPassedResult();
    if (clientIdsInvolved.length > 2) return this.getNonPassedResult(currentCell);

    const isProperPair = this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
    if (isProperPair) return this.getPassedResult();
    else return this.getNonPassedResult(currentCell);
  }

  private getNonPassedResult(currentCell: ScheduleItem): Result {
    const nextPossibleInterval = this.timeIntervalManager.shiftBySessionLength(
      currentCell.timeInterval,
    );
    return {
      passed: false,
      nextTryHint: {
        firstValidInterval: nextPossibleInterval,
      },
    };
  }

  private getPassedResult(): Result {
    return { passed: true };
  }
}
