import { ClientPairService } from '../../../../client/client-pair.service';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleCell, Table } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(
    private readonly pairService: ClientPairService,
    private readonly timeIntervalManager: TimeIntervalManager,
  ) {}
  public check(
    _table: Table,
    _cellsOnSameDay: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): Result {
    const { clientIdsInvolved } = currentCell;
    if (clientIdsInvolved.length < 2) return this.getPassedResult();
    if (clientIdsInvolved.length > 2) return this.getNonPassedResult(currentCell);

    const isProperPair = this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
    if (isProperPair) return this.getPassedResult();
    else return this.getNonPassedResult(currentCell);
  }

  private getNonPassedResult(currentCell: ScheduleCell): Result {
    const nextPossibleInterval = this.timeIntervalManager.shiftBySessionLength(
      currentCell.timeInterval,
    );
    return {
      passed: false,
      nextTryHint: {
        firstValidInterval: nextPossibleInterval,
      },
      name: ProperPairsSpecification.name,
    };
  }

  private getPassedResult(): Result {
    return { passed: true };
  }
}
