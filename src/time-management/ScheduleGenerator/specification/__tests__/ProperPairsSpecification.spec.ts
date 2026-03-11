import { methodName } from '../../../../utils/test-name';
import { ClientPairService } from '../../../client/client-pair.service';
import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { makeWeekTime } from '../../../definition/WeekTime';
import { Table } from '../../Table';
import { ProperPairsSpecification } from '../rules/ProperPairsSpecification';
import { createExpectedResult, makeTable } from './SpecificationTestHelper';

describe(methodName(ProperPairsSpecification, 'check'), () => {
  let pairService: ClientPairService;
  let unitUnderTest: ProperPairsSpecification;

  beforeEach(() => {
    localStorage.clear();
    pairService = new ClientPairService();
    unitUnderTest = new ProperPairsSpecification(pairService);
  });

  const acceptAll = (table: Table): void => {
    for (let i = 0; i < table.cellPart.views.linear.length; i++)
      expect(unitUnderTest.check(table, i)).toEqual(createExpectedResult(true));
  };

  it('returns true when no clients are assigned to any cells', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
    ]);
    acceptAll(table);
  });

  it('returns true when all cells have only single clients', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(2, [10, 0], [11, 45]), clientIdsInvolved: [3] },
    ]);
    acceptAll(table);
  });

  it('returns true when cells have pairs that exist in the pairService', () => {
    pairService.addPair(1, 2);
    pairService.addPair(4, 3);

    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1, 2] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [3, 4] },
    ]);

    acceptAll(table);
  });

  it('returns false when an cell has a pair that does not exist in the pairService', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1, 2] },
    ]);

    const expected = createExpectedResult(makeWeekTime(1, 8, 45));
    expect(unitUnderTest.check(table, 0)).toEqual(expected);
  });

  it('returns false when an cell has more than 2 clients', () => {
    const table = makeTable([
      {
        timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]),
        clientIdsInvolved: [1, 2, 3],
      },
    ]);

    const expected = createExpectedResult(makeWeekTime(1, 8, 45));
    expect(unitUnderTest.check(table, 0)).toEqual(expected);
  });

  it('returns true for mixed cells with singles, valid pairs, and empty cells', () => {
    pairService.addPair(2, 3);

    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [2, 3] },
    ]);

    acceptAll(table);
  });

  it('returns false when one pair is invalid among multiple cells', () => {
    pairService.addPair(1, 2);

    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1, 2] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [3, 4] },
    ]);

    const expected = createExpectedResult(makeWeekTime(1, 10, 0));
    expect(unitUnderTest.check(table, 1)).toEqual(expected);
  });

  it('returns false when one cell has 3+ clients even if other cells are valid', () => {
    pairService.addPair(1, 2);
    pairService.addPair(3, 4);
    pairService.addPair(4, 5);
    pairService.addPair(3, 5);

    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1, 2] },
      {
        timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]),
        clientIdsInvolved: [3, 4, 5],
      },
    ]);

    const expected = createExpectedResult(makeWeekTime(1, 10, 0));
    expect(unitUnderTest.check(table, 1)).toEqual(expected);
  });
});
