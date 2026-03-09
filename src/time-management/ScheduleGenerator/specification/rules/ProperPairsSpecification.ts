import { ClientPairService } from '../../../client/client-pair.service';
import { TimeManager } from '../../../managers/TimeManager';
import { Table, TableCell } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(
    private readonly pairService: ClientPairService,
    private readonly timeManager: TimeManager,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): Result {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const { clientIdsInvolved } = currentCell;
    if (clientIdsInvolved.length < 2) return this.getPassedResult();
    if (clientIdsInvolved.length > 2) return this.getNonPassedResult(currentCell);

    const isProperPair = this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
    if (isProperPair) return this.getPassedResult();
    else return this.getNonPassedResult(currentCell);
  }

  private getNonPassedResult({ timeInterval }: TableCell): Result {
    const nextPossibleStart = this.timeManager.shiftBySessionLength({
      dayNumber: timeInterval.dayNumber,
      ...timeInterval.start,
    });
    return {
      passed: false,
      nextTryHint: {
        firstValidStart: nextPossibleStart,
      },
      name: ProperPairsSpecification.name,
    };
  }

  private getPassedResult(): Result {
    return { passed: true };
  }
}
