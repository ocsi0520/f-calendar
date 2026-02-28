import { methodName } from '../../../../utils/test-name';
import { ProperPairsSpecification } from '../rules/ProperPairsSpecification';
import { ClientPairService } from '../../../../client/client-pair.service';
import { createExpectedResult, makeTable, selectForSpec } from './SpecificationTestHelper';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { TimeManager } from '../../../TimeManager';
import { Table } from '../../Table';

describe(methodName(ProperPairsSpecification, 'check'), () => {
  let pairService: ClientPairService;
  let unitUnderTest: ProperPairsSpecification;

  beforeEach(() => {
    localStorage.clear();
    pairService = new ClientPairService();
    unitUnderTest = new ProperPairsSpecification(
      pairService,
      new TimeIntervalManager(new TimeManager()),
    );
  });

  const acceptAll = (table: Table): void => {
    for (
      table.currentScheduleCellIndex = 0;
      table.currentScheduleCellIndex < table.scheduleCells.length;
      table.currentScheduleCellIndex++
    )
      expect(unitUnderTest.check(...selectForSpec(table))).toEqual(createExpectedResult(true));
  };

  it('returns true when no clients are assigned to any cells', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
    ]);
    acceptAll(table);
  });

  it('returns true when all cells have only single clients', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 45] }, clientIdsInvolved: [3] },
    ]);
    acceptAll(table);
  });

  it('returns true when cells have pairs that exist in the pairService', () => {
    pairService.addPair(1, 2);
    pairService.addPair(4, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);

    acceptAll(table);
  });

  it('returns false when an cell has a pair that does not exist in the pairService', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
    ]);

    const expected = createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] });
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expected);
  });

  it('returns false when an cell has more than 2 clients', () => {
    const table = makeTable([
      {
        timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] },
        clientIdsInvolved: [1, 2, 3],
      },
    ]);

    const expected = createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] });
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expected);
  });

  it('returns true for mixed cells with singles, valid pairs, and empty cells', () => {
    pairService.addPair(2, 3);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [2, 3] },
    ]);

    acceptAll(table);
  });

  it('returns false when one pair is invalid among multiple cells', () => {
    pairService.addPair(1, 2);

    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 4] },
    ]);
    table.currentScheduleCellIndex = 1;

    const expected = createExpectedResult({ dayNumber: 1, start: [10, 0], end: [11, 15] });
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expected);
  });

  it('returns false when one cell has 3+ clients even if other cells are valid', () => {
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
    table.currentScheduleCellIndex = 1;

    const expected = createExpectedResult({ dayNumber: 1, start: [10, 0], end: [11, 15] });
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expected);
  });
});
