import { methodName } from '../../../../utils/test-name';
import { ProperPairsSpecification } from '../rules/ProperPairsSpecification';
import { ClientPairService } from '../../../../client/client-pair.service';
import { makeTable, selectForSpec } from './SpecificationTestHelper';

describe(methodName(ProperPairsSpecification, 'check'), () => {
  let pairService: ClientPairService;
  let unitUnderTest: ProperPairsSpecification;

  beforeEach(() => {
    localStorage.clear();
    pairService = new ClientPairService();
    unitUnderTest = new ProperPairsSpecification(pairService);
  });

  it('returns true when no clients are assigned to any cells', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table, table.scheduleItems, table.scheduleItems[0])).toBe(true);
    expect(unitUnderTest.check(table, table.scheduleItems, table.scheduleItems[1])).toBe(true);
  });

  it('returns true when all items have only single clients', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 45] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when items have pairs that exist in the pairService', () => {
    pairService.addPair(1, 2);
    pairService.addPair(4, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when an item has a pair that does not exist in the pairService', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns false when an item has more than 2 clients', () => {
    const table = makeTable([
      {
        timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] },
        clientIdsInvolved: [1, 2, 3],
      },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns true for mixed items with singles, valid pairs, and empty items', () => {
    pairService.addPair(2, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [2, 3] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when one pair is invalid among multiple items', () => {
    pairService.addPair(1, 2);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);
    table.currentScheduleItemIndex = 1;

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns false when one item has 3+ clients even if other items are valid', () => {
    pairService.addPair(1, 2);
    pairService.addPair(3, 4);
    pairService.addPair(4, 5);
    pairService.addPair(3, 5);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      {
        timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] },
        clientIdsInvolved: [3, 4, 5],
      },
    ]);
    table.currentScheduleItemIndex = 1;

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });
});
