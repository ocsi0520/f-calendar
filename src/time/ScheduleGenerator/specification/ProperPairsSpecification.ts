import { ClientPairService } from '../../../client/client-pair.service';
import { ScheduleItem, Table } from '../Table';
import { ScheduleSpecification } from './specification';

export class ProperPairsSpecification implements ScheduleSpecification {
  constructor(private readonly pairService: ClientPairService) {}
  public check(table: Table): boolean {
    const allItemsWithMultiplePeople = table.scheduleItems.filter(
      (item) => item.clientIdsInvolved.length > 1,
    );
    return allItemsWithMultiplePeople.every(this.checkItemWithMultiplePeople.bind(this));
  }
  private checkItemWithMultiplePeople({ clientIdsInvolved }: ScheduleItem): boolean {
    if (clientIdsInvolved.length > 2) return false;
    return this.pairService.exists(clientIdsInvolved[0], clientIdsInvolved[1]);
  }
}
