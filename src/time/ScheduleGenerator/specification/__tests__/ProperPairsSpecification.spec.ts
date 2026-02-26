import { methodName } from '../../../../utils/test-name';
import { ScheduleItem, Table } from '../../Table';
import { ProperPairsSpecification } from '../rules/ProperPairsSpecification';
import { ClientPairService } from '../../../../client/client-pair.service';

describe(methodName(ProperPairsSpecification, 'check'), () => {
  let pairService: ClientPairService;
  let unitUnderTest: ProperPairsSpecification;

  beforeEach(() => {
    localStorage.clear();
    pairService = new ClientPairService();
    unitUnderTest = new ProperPairsSpecification(pairService);
  });

  const makeTable = (scheduleItems: ScheduleItem[]): Table => ({
    clientInfos: [],
    currentClientIndex: 0,
    scheduleItems,
    currentScheduleItemIndex: 0,
  });

  it('returns true when there are no schedule items', () => {
    const table = makeTable([]);
    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when no clients are assigned to any cells', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when all items have only single clients', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 45] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when items have pairs that exist in the pairService', () => {
    pairService.addPair(1, 2);
    pairService.addPair(4, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when an item has a pair that does not exist in the pairService', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns false when an item has more than 2 clients', () => {
    const table = makeTable([
      {
        timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] },
        clientIdsInvolved: [1, 2, 3],
      },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns true for mixed items with singles, valid pairs, and empty items', () => {
    pairService.addPair(2, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [2, 3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when one pair is invalid among multiple items', () => {
    pairService.addPair(1, 2);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
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

    expect(unitUnderTest.check(table)).toBe(false);
  });
});
