import { methodName } from '../../../../utils/test-name';
import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { TimeManager } from '../../../managers/TimeManager';
import { Table } from '../../Table';
import { NoOverlappingSessionsSpecification } from '../rules/NoOverlappingSessionsSpecification';
import { Result } from '../specification';
import { createExpectedResult, makeTable } from './SpecificationTestHelper';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeMapper } from '../../../mappers/TimeMapper';
import { makeWeekTime } from '../../../definition/WeekTime';

// TODO: allow
describe.skip(methodName(NoOverlappingSessionsSpecification, 'check'), () => {
  let unitUnderTest: NoOverlappingSessionsSpecification;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    const timeManager = new TimeManager(timeMapper);
    unitUnderTest = new NoOverlappingSessionsSpecification(
      new SameDayIntervalManager(timeManager, timeMapper),
    );
  });

  const acceptAllNonEmpty = (table: Table): void => {
    for (let i = 0; i < table.cellPart.views.linear.length; i++) {
      const isEmptyCell = table.cellPart.views.linear[i].clientIdsInvolved.length === 0;
      if (isEmptyCell) continue;
      expect(unitUnderTest.check(table, i)).toEqual(createExpectedResult(true));
    }
  };

  const testDetailed = (table: Table, expectedResults: Array<Result | null>): void => {
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      expect(unitUnderTest.check(table, i)).toEqual(expectedResults[i]);
    }
  };

  it('returns true when no cells are occupied (empty clientIdsInvolved)', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when two cells are adjacent mixed with non-occupied cells', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when two cells are adjacent', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells do not overlap on the same day', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are exactly adjacent (no overlap)', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are on different days', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(2, [7, 45], [9, 0]), clientIdsInvolved: [1] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when middle cell is on different day', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 15], [8, 30]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(2, [7, 30], [8, 45]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(3, [7, 45], [9, 0]), clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap: first starts before second ends', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 9, 45)));

    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(makeWeekTime(1, 8, 45)));
  });

  it('returns true with mixed occupied and unoccupied cells when no overlaps exist', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 15], [8, 30]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 45]), clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap even with unoccupied cells between them', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 9, 45)));

    expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 9, 0)));
  });

  it('returns true when only one cell is occupied', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for multiple non-overlapping occupied cells across multiple days', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(2, [7, 45], [9, 0]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(2, [9, 0], [10, 15]), clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for only one', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [4] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [5] },
      { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 30], [12, 45]), clientIdsInvolved: [6] },
      { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [] },
    ]);
    const expectedResults: Array<Result | null> = [
      createExpectedResult(makeWeekTime(1, 9, 0)),
      createExpectedResult(makeWeekTime(1, 8, 45)),
      null,
      null,
      // first it finds the 0-indexed cell, so it'll calculate from that one
      createExpectedResult(makeWeekTime(1, 8, 45)),
      null,
      null,
      null,
      null,
      createExpectedResult(true),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 12, 45)),
      null,
      createExpectedResult(makeWeekTime(1, 12, 15)),
      null,
    ];
    testDetailed(table, expectedResults);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2, 3] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [4] },
      { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [5] },
      { timeInterval: makeSameDayInterval(1, [11, 30], [12, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 0], [13, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 15], [13, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 30], [13, 45]), clientIdsInvolved: [6] },
    ]);
    acceptAllNonEmpty(table);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2, 3] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [4] },
      { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [5] },
      { timeInterval: makeSameDayInterval(1, [12, 30], [13, 45]), clientIdsInvolved: [6] },
    ]);
    acceptAllNonEmpty(table);
  });

  describe('first-middle-last', () => {
    describe('scenario 1: initially overlapping with both', () => {
      it('return false, for the middle due to surroundings', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [3] },
        ]);

        const expectedResult = createExpectedResult(makeWeekTime(1, 8, 45));
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [3] },
        ]);

        const expectedInterval = makeWeekTime(1, 10, 30);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns true for last', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [3] },
          {
            timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]),
            clientIdsInvolved: [2],
          },
        ]);

        acceptAllNonEmpty(table);
      });
    });

    describe('scenario 2: initially overlapping with first one', () => {
      it('returns false for middle due to first one', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [8, 0], [9, 45]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [3] },
        ]);

        const expectedResult = createExpectedResult(makeWeekTime(1, 8, 45));
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns false for middle due to first one', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [3] },
        ]);

        const expectedInterval = makeWeekTime(1, 10, 45);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns true', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [3] },
          { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [2] },
        ]);

        acceptAllNonEmpty(table);
      });
    });

    describe('scenario 3: initially overlapping with latter one', () => {
      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [3] },
        ]);

        const expectedInterval = makeWeekTime(1, 10, 45);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });
      it('returns true', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [3] },
          { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [2] },
        ]);

        acceptAllNonEmpty(table);
      });
    });
    describe('scenario 4: initially overlapping with second one, but there is enough space to get into middle', () => {
      it('should return false for first one', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [3] },
          { timeInterval: makeSameDayInterval(1, [11, 30], [12, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [] },
        ]);

        const expectedInterval = makeWeekTime(1, 10, 0);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('should return true', () => {
        const table = makeTable([
          { timeInterval: makeSameDayInterval(1, [7, 30], [8, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [7, 45], [9, 0]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [2] },
          { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [1] },
          { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [3] },
          { timeInterval: makeSameDayInterval(1, [11, 30], [12, 45]), clientIdsInvolved: [] },
          { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [] },
        ]);

        acceptAllNonEmpty(table);
      });
    });
  });

  it('returns false for all, except last one', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [4] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [5] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [6] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [7] },
      { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [8] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [9] },
      // all of them were before
      { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 45], [12, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 15], [12, 30]), clientIdsInvolved: [10] },
      { timeInterval: makeSameDayInterval(1, [11, 30], [12, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 0], [13, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 15], [13, 30]), clientIdsInvolved: [11] },
      { timeInterval: makeSameDayInterval(1, [12, 30], [13, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [12, 45], [14, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [13, 0], [14, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [13, 15], [14, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [13, 30], [14, 45]), clientIdsInvolved: [12] },
      { timeInterval: makeSameDayInterval(1, [13, 45], [15, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [14, 0], [15, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [14, 15], [15, 30]), clientIdsInvolved: [13] },
      { timeInterval: makeSameDayInterval(1, [14, 30], [15, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [14, 45], [16, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [15, 0], [16, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [15, 15], [16, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [15, 30], [16, 45]), clientIdsInvolved: [14] },
      { timeInterval: makeSameDayInterval(1, [15, 45], [17, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [15] },
      { timeInterval: makeSameDayInterval(1, [16, 15], [17, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [16, 30], [17, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [16, 45], [18, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [17, 0], [18, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [17, 15], [18, 30]), clientIdsInvolved: [16] },
      { timeInterval: makeSameDayInterval(1, [17, 30], [18, 45]), clientIdsInvolved: [17] },
      { timeInterval: makeSameDayInterval(1, [17, 45], [19, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [18, 0], [19, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [18, 15], [19, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [18, 30], [19, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [18, 45], [20, 0]), clientIdsInvolved: [18] },
      { timeInterval: makeSameDayInterval(1, [19, 0], [20, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [19, 15], [20, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [19, 30], [20, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [19, 45], [21, 0]), clientIdsInvolved: [] },
    ]);
    testDetailed(table, [
      createExpectedResult(makeWeekTime(1, 9, 30)),
      createExpectedResult(makeWeekTime(1, 9, 15)),
      createExpectedResult(makeWeekTime(1, 9, 15)),
      createExpectedResult(makeWeekTime(1, 9, 15)),
      createExpectedResult(makeWeekTime(1, 9, 15)),
      createExpectedResult(makeWeekTime(1, 9, 30)),
      createExpectedResult(makeWeekTime(1, 9, 45)),
      createExpectedResult(makeWeekTime(1, 10, 0)),
      createExpectedResult(makeWeekTime(1, 10, 15)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 13, 30)),
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 12, 30)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 15, 30)),
      null,
      null,
      createExpectedResult(makeWeekTime(1, 14, 45)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 17, 15)),
      null,
      createExpectedResult(makeWeekTime(1, 16, 45)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 18, 45)),
      createExpectedResult(makeWeekTime(1, 18, 30)),
      null,
      null,
      null,
      null,
      createExpectedResult(true),
      null,
      null,
      null,
      null,
    ]);
  });
});
