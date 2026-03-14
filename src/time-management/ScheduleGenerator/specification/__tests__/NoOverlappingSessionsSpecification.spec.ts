import { methodName } from '../../../../utils/test-name';
import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { TimeManager } from '../../../managers/TimeManager';
import { Table } from '../../Table';
import { NoOverlappingSessionsSpecification } from '../rules/NoOverlappingSessionsSpecification';
import { NextValidStartResult } from '../specification';
import { createExpectedResult, makeTable } from './SpecificationTestHelper';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeMapper } from '../../../mappers/TimeMapper';
import { makeWeekTime } from '../../../definition/WeekTime';
import { makeTableCell } from '../../__tests__/makeEmptyTableCell';

describe(methodName(NoOverlappingSessionsSpecification, 'check'), () => {
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

  const testDetailed = (table: Table, expectedResults: Array<NextValidStartResult>): void => {
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      expect(unitUnderTest.check(table, i)).toEqual(expectedResults[i]);
    }
  };

  it('returns true when no cells are occupied (empty clientIdsInvolved)', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], []),
      makeTableCell(1, [8, 0], [9, 15], []),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when two cells are adjacent mixed with non-occupied cells', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [7, 45], [9, 0], []),
      makeTableCell(1, [8, 0], [9, 15], []),
      makeTableCell(1, [8, 15], [9, 30], []),
      makeTableCell(1, [8, 30], [9, 45], []),
      makeTableCell(1, [8, 45], [10, 0], [2]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when two cells are adjacent', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [8, 45], [10, 0], [2]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells do not overlap on the same day', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [9, 0], [10, 15], [2]),
      makeTableCell(1, [10, 30], [11, 45], [3]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are exactly adjacent (no overlap)', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [8, 45], [10, 0], [2]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are on different days', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(2, [7, 45], [9, 0], [1]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when middle cell is on different day', () => {
    const table = makeTable([
      makeTableCell(1, [7, 15], [8, 30], [1]),
      makeTableCell(2, [7, 30], [8, 45], [2]),
      makeTableCell(3, [7, 45], [9, 0], [3]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap: first starts before second ends', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [8, 30], [9, 45], [2]),
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 8, 30)));
    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(makeWeekTime(1, 7, 30)));
  });

  it('returns true with mixed occupied and unoccupied cells when no overlaps exist', () => {
    const table = makeTable([
      makeTableCell(1, [7, 15], [8, 30], [1]),
      makeTableCell(1, [8, 15], [9, 30], []),
      makeTableCell(1, [8, 45], [10, 45], [2]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap even with unoccupied cells between them', () => {
    const table = makeTable([
      makeTableCell(1, [7, 45], [9, 0], [1]),
      makeTableCell(1, [8, 15], [9, 30], []),
      makeTableCell(1, [8, 30], [9, 45], [2]),
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 8, 30)));

    expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 7, 45)));
  });

  it('returns true when only one cell is occupied', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [8, 45], [10, 0], []),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for multiple non-overlapping occupied cells across multiple days', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [9, 0], [10, 15], [2]),
      makeTableCell(2, [7, 45], [9, 0], [1]),
      makeTableCell(2, [9, 0], [10, 15], [3]),
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for only one', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [7, 45], [9, 0], [2]),
      makeTableCell(1, [8, 0], [9, 15], []),
      makeTableCell(1, [8, 15], [9, 30], []),
      makeTableCell(1, [8, 30], [9, 45], [3]),
      makeTableCell(1, [8, 45], [10, 0], []),
      makeTableCell(1, [9, 0], [10, 15], []),
      makeTableCell(1, [9, 15], [10, 30], []),
      makeTableCell(1, [9, 30], [10, 45], []),
      makeTableCell(1, [9, 45], [11, 0], [4]),
      makeTableCell(1, [10, 0], [11, 15], []),
      makeTableCell(1, [10, 15], [11, 30], []),
      makeTableCell(1, [10, 30], [11, 45], []),
      makeTableCell(1, [10, 45], [12, 0], []),
      makeTableCell(1, [11, 0], [12, 15], [5]),
      makeTableCell(1, [11, 15], [12, 30], []),
      makeTableCell(1, [11, 30], [12, 45], [6]),
      makeTableCell(1, [11, 45], [13, 0], []),
    ]);
    const expectedResults: Array<NextValidStartResult> = [
      createExpectedResult(makeWeekTime(1, 7, 45)),
      createExpectedResult(makeWeekTime(1, 7, 30)),
      null,
      null,
      // first it finds the 0-indexed cell, so it'll calculate from that one
      createExpectedResult(makeWeekTime(1, 7, 30)),
      null,
      null,
      null,
      null,
      createExpectedResult(true),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 11, 30)),
      null,
      createExpectedResult(makeWeekTime(1, 11, 0)),
      null,
    ];
    testDetailed(table, expectedResults);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [7, 45], [9, 0], []),
      makeTableCell(1, [8, 0], [9, 15], []),
      makeTableCell(1, [8, 15], [9, 30], []),
      makeTableCell(1, [8, 30], [9, 45], []),
      makeTableCell(1, [8, 45], [10, 0], [2, 3]),
      makeTableCell(1, [9, 0], [10, 15], []),
      makeTableCell(1, [9, 15], [10, 30], []),
      makeTableCell(1, [9, 30], [10, 45], []),
      makeTableCell(1, [9, 45], [11, 0], []),
      makeTableCell(1, [10, 0], [11, 15], [4]),
      makeTableCell(1, [10, 15], [11, 30], []),
      makeTableCell(1, [10, 30], [11, 45], []),
      makeTableCell(1, [10, 45], [12, 0], []),
      makeTableCell(1, [11, 0], [12, 15], []),
      makeTableCell(1, [11, 15], [12, 30], [5]),
      makeTableCell(1, [11, 30], [12, 45], []),
      makeTableCell(1, [11, 45], [13, 0], []),
      makeTableCell(1, [12, 0], [13, 15], []),
      makeTableCell(1, [12, 15], [13, 30], []),
      makeTableCell(1, [12, 30], [13, 45], [6]),
    ]);
    acceptAllNonEmpty(table);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      makeTableCell(1, [7, 30], [8, 45], [1]),
      makeTableCell(1, [8, 45], [10, 0], [2, 3]),
      makeTableCell(1, [10, 0], [11, 15], [4]),
      makeTableCell(1, [11, 15], [12, 30], [5]),
      makeTableCell(1, [12, 30], [13, 45], [6]),
    ]);
    acceptAllNonEmpty(table);
  });

  describe('first-middle-last', () => {
    describe('scenario 1: initially overlapping with both', () => {
      it('return false, for the middle due to surroundings', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [8, 15], [9, 30], [2]),
          makeTableCell(1, [9, 15], [10, 30], [3]),
        ]);

        const expectedResult = createExpectedResult(makeWeekTime(1, 7, 30));
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [8, 45], [10, 0], [2]),
          makeTableCell(1, [9, 15], [10, 30], [3]),
        ]);

        const expectedInterval = makeWeekTime(1, 9, 15);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns true for last', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [9, 15], [10, 30], [3]),
          makeTableCell(1, [10, 30], [11, 45], [2]),
        ]);

        acceptAllNonEmpty(table);
      });
    });

    describe('scenario 2: initially overlapping with first one', () => {
      it('returns false for middle due to first one', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [8, 0], [9, 45], [2]),
          makeTableCell(1, [9, 30], [10, 45], [3]),
        ]);

        const expectedResult = createExpectedResult(makeWeekTime(1, 7, 30));
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns false for middle due to first one', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [8, 45], [10, 0], [2]),
          makeTableCell(1, [9, 30], [10, 45], [3]),
        ]);

        const expectedInterval = makeWeekTime(1, 9, 30);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('returns true', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [9, 30], [10, 45], [3]),
          makeTableCell(1, [10, 45], [12, 0], [2]),
        ]);

        acceptAllNonEmpty(table);
      });
    });

    describe('scenario 3: initially overlapping with latter one', () => {
      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [9, 0], [10, 15], [2]),
          makeTableCell(1, [9, 30], [10, 45], [3]),
        ]);

        const expectedInterval = makeWeekTime(1, 9, 30);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });
      it('returns true', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], [1]),
          makeTableCell(1, [9, 30], [10, 45], [3]),
          makeTableCell(1, [10, 45], [12, 0], [2]),
        ]);

        acceptAllNonEmpty(table);
      });
    });
    describe('scenario 4: initially overlapping with second one, but there is enough space to get into middle', () => {
      it('should return false for first one', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], []),
          makeTableCell(1, [7, 45], [9, 0], [1]),
          makeTableCell(1, [8, 0], [9, 15], []),
          makeTableCell(1, [8, 15], [9, 30], []),
          makeTableCell(1, [8, 30], [9, 45], []),
          makeTableCell(1, [8, 45], [10, 0], [2]),
          makeTableCell(1, [9, 0], [10, 15], []),
          makeTableCell(1, [9, 15], [10, 30], []),
          makeTableCell(1, [9, 30], [10, 45], []),
          makeTableCell(1, [9, 45], [11, 0], []),
          makeTableCell(1, [10, 0], [11, 15], []),
          makeTableCell(1, [10, 15], [11, 30], []),
          makeTableCell(1, [10, 30], [11, 45], []),
          makeTableCell(1, [10, 45], [12, 0], []),
          makeTableCell(1, [11, 0], [12, 15], []),
          makeTableCell(1, [11, 15], [12, 30], [3]),
          makeTableCell(1, [11, 30], [12, 45], []),
          makeTableCell(1, [11, 45], [13, 0], []),
        ]);

        const expectedInterval = makeWeekTime(1, 8, 45);
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(table, 1)).toEqual(expectedResult);
      });

      it('should return true', () => {
        const table = makeTable([
          makeTableCell(1, [7, 30], [8, 45], []),
          makeTableCell(1, [7, 45], [9, 0], []),
          makeTableCell(1, [8, 0], [9, 15], []),
          makeTableCell(1, [8, 15], [9, 30], []),
          makeTableCell(1, [8, 30], [9, 45], []),
          makeTableCell(1, [8, 45], [10, 0], [2]),
          makeTableCell(1, [9, 0], [10, 15], []),
          makeTableCell(1, [9, 15], [10, 30], []),
          makeTableCell(1, [9, 30], [10, 45], []),
          makeTableCell(1, [9, 45], [11, 0], []),
          makeTableCell(1, [10, 0], [11, 15], [1]),
          makeTableCell(1, [10, 15], [11, 30], []),
          makeTableCell(1, [10, 30], [11, 45], []),
          makeTableCell(1, [10, 45], [12, 0], []),
          makeTableCell(1, [11, 0], [12, 15], []),
          makeTableCell(1, [11, 15], [12, 30], [3]),
          makeTableCell(1, [11, 30], [12, 45], []),
          makeTableCell(1, [11, 45], [13, 0], []),
        ]);

        acceptAllNonEmpty(table);
      });
    });
  });

  it('returns false for all, except last one', () => {
    const table = makeTable([
      makeTableCell(1, [8, 0], [9, 15], [1]),
      makeTableCell(1, [8, 15], [9, 30], [2]),
      makeTableCell(1, [8, 30], [9, 45], [3]),
      makeTableCell(1, [8, 45], [10, 0], [4]),
      makeTableCell(1, [9, 0], [10, 15], [5]),
      makeTableCell(1, [9, 15], [10, 30], [6]),
      makeTableCell(1, [9, 30], [10, 45], [7]),
      makeTableCell(1, [9, 45], [11, 0], [8]),
      makeTableCell(1, [10, 0], [11, 15], [9]),
      // all of them were before
      makeTableCell(1, [10, 15], [11, 30], []),
      makeTableCell(1, [10, 30], [11, 45], []),
      makeTableCell(1, [10, 45], [12, 0], []),
      makeTableCell(1, [11, 0], [12, 15], []),
      makeTableCell(1, [11, 15], [12, 30], [10]),
      makeTableCell(1, [11, 30], [12, 45], []),
      makeTableCell(1, [11, 45], [13, 0], []),
      makeTableCell(1, [12, 0], [13, 15], []),
      makeTableCell(1, [12, 15], [13, 30], [11]),
      makeTableCell(1, [12, 30], [13, 45], []),
      makeTableCell(1, [12, 45], [14, 0], []),
      makeTableCell(1, [13, 0], [14, 15], []),
      makeTableCell(1, [13, 15], [14, 30], []),
      makeTableCell(1, [13, 30], [14, 45], [12]),
      makeTableCell(1, [13, 45], [15, 0], []),
      makeTableCell(1, [14, 0], [15, 15], []),
      makeTableCell(1, [14, 15], [15, 30], [13]),
      makeTableCell(1, [14, 30], [15, 45], []),
      makeTableCell(1, [14, 45], [16, 0], []),
      makeTableCell(1, [15, 0], [16, 15], []),
      makeTableCell(1, [15, 15], [16, 30], []),
      makeTableCell(1, [15, 30], [16, 45], [14]),
      makeTableCell(1, [15, 45], [17, 0], []),
      makeTableCell(1, [16, 0], [17, 15], [15]),
      makeTableCell(1, [16, 15], [17, 30], []),
      makeTableCell(1, [16, 30], [17, 45], []),
      makeTableCell(1, [16, 45], [18, 0], []),
      makeTableCell(1, [17, 0], [18, 15], []),
      makeTableCell(1, [17, 15], [18, 30], [16]),
      makeTableCell(1, [17, 30], [18, 45], [17]),
      makeTableCell(1, [17, 45], [19, 0], []),
      makeTableCell(1, [18, 0], [19, 15], []),
      makeTableCell(1, [18, 15], [19, 30], []),
      makeTableCell(1, [18, 30], [19, 45], []),
      makeTableCell(1, [18, 45], [20, 0], [18]),
      makeTableCell(1, [19, 0], [20, 15], []),
      makeTableCell(1, [19, 15], [20, 30], []),
      makeTableCell(1, [19, 30], [20, 45], []),
      makeTableCell(1, [19, 45], [21, 0], []),
    ]);
    testDetailed(table, [
      createExpectedResult(makeWeekTime(1, 8, 15)),
      createExpectedResult(makeWeekTime(1, 8, 0)),
      createExpectedResult(makeWeekTime(1, 8, 0)),
      createExpectedResult(makeWeekTime(1, 8, 0)),
      createExpectedResult(makeWeekTime(1, 8, 0)),
      createExpectedResult(makeWeekTime(1, 8, 15)),
      createExpectedResult(makeWeekTime(1, 8, 30)),
      createExpectedResult(makeWeekTime(1, 8, 45)),
      createExpectedResult(makeWeekTime(1, 9, 0)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 12, 15)),
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 11, 15)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 14, 15)),
      null,
      null,
      createExpectedResult(makeWeekTime(1, 13, 30)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 16, 0)),
      null,
      createExpectedResult(makeWeekTime(1, 15, 30)),
      null,
      null,
      null,
      null,
      createExpectedResult(makeWeekTime(1, 17, 30)),
      createExpectedResult(makeWeekTime(1, 17, 15)),
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
