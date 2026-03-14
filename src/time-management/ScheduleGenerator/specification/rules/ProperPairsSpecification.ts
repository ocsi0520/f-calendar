import { ClientPairService } from '../../../client/client-pair.service';
import { Table, TableCell } from '../../Table';
import { NextValidStartResult, ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(private readonly pairService: ClientPairService) {}
  public check(table: Table, currentCellLinearIndex: number): NextValidStartResult {
    const currentCell = table.cellPart.views.linear[currentCellLinearIndex];
    const { clientIdsInvolved } = currentCell;
    if (clientIdsInvolved.length < 2) return null;
    if (clientIdsInvolved.length > 2) return this.getNonPassedResult(currentCell);

    const isProperPair = this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
    if (isProperPair) return null;
    else return this.getNonPassedResult(currentCell);
  }

  private getNonPassedResult({ timeInterval }: TableCell): NextValidStartResult {
    return {
      dayNumber: timeInterval.dayNumber,
      hour: timeInterval.end.hour,
      minute: timeInterval.end.minute,
    };
  }
}
