import { ClientPairService } from '../../../../client/client-pair.service';
import { ScheduleItem, Table } from '../../Table';
import { ScheduleSpecification } from '../specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(private readonly pairService: ClientPairService) {}
  public check(
    _table: Table,
    _cellsOnSameDay: Array<ScheduleItem>,
    { clientIdsInvolved }: ScheduleItem,
  ): boolean {
    if (clientIdsInvolved.length < 2) return true;
    if (clientIdsInvolved.length > 2) return false;
    return this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
  }
}
