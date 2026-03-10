import { ClientPairService } from '../../../client/client-pair.service';
import { TimeManager } from '../../../managers/TimeManager';
import { Table, TableCell } from '../../Table';
import { NextValidStartResult, Result, ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(
    private readonly pairService: ClientPairService,
    private readonly timeManager: TimeManager,
  ) {}
  public check(table: Table, currentCellLinearIndex: number): Result {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const { clientIdsInvolved } = currentCell;
    if (clientIdsInvolved.length < 2) return null;
    if (clientIdsInvolved.length > 2) return this.getNonPassedResult(currentCell);

    const isProperPair = this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
    if (isProperPair) return null;
    else return this.getNonPassedResult(currentCell);
  }

  private getNonPassedResult({ timeInterval }: TableCell): NextValidStartResult {
    const nextPossibleStart = this.timeManager.shiftBySessionLength({
      dayNumber: timeInterval.dayNumber,
      hour: timeInterval.start.hour,
      minute: timeInterval.start.minute,
    });
    return nextPossibleStart;
  }
}
