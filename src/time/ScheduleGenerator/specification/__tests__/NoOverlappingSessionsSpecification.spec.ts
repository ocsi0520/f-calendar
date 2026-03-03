import { beforeEach, describe, it, expect } from 'vitest';
import { NoOverlappingSessionsSpecification } from '../rules/NoOverlappingSessionsSpecification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { methodName } from '../../../../utils/test-name';
import { createExpectedResult, makeTable, selectForSpec } from './SpecificationTestHelper';
import { TimeManager } from '../../../TimeManager';
import { Table } from '../../Table';
import { Result } from '../specification';
import { TimeInterval } from '../../../TimeInterval/TimeInterval';

describe(methodName(NoOverlappingSessionsSpecification, 'check'), () => {
  let unitUnderTest: NoOverlappingSessionsSpecification;

  beforeEach(() => {
    const timeManager = new TimeManager();
    unitUnderTest = new NoOverlappingSessionsSpecification(new TimeIntervalManager(timeManager));
  });

  const acceptAllNonEmpty = (table: Table): void => {
    for (
      table.currentScheduleCellIndex = 0;
      table.currentScheduleCellIndex < table.scheduleCells.length;
      table.currentScheduleCellIndex++
    ) {
      const isEmptyCell =
        table.scheduleCells[table.currentScheduleCellIndex].clientIdsInvolved.length === 0;
      if (isEmptyCell) continue;
      expect(unitUnderTest.check(...selectForSpec(table))).toEqual(createExpectedResult(true));
    }
  };

  const testDetailed = (table: Table, expectedResults: Array<Result | null>): void => {
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      table.currentScheduleCellIndex = i;
      expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResults[i]);
    }
  };

  it('returns true when no cells are occupied (empty clientIdsInvolved)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when two cells are adjacent', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells do not overlap on the same day', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are exactly adjacent (no overlap)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when occupied cells are on different days', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true when middle cell is on different day', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 15], end: [8, 30] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 3, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap: first starts before second ends', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [2] },
    ]);

    table.currentScheduleCellIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(
      createExpectedResult({ dayNumber: 1, start: [9, 45], end: [11, 0] }),
    );

    table.currentScheduleCellIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(
      createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] }),
    );
  });

  it('returns true with mixed occupied and unoccupied cells when no overlaps exist', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 15], end: [8, 30] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 45] }, clientIdsInvolved: [2] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns false when occupied cells overlap even with unoccupied cells between them', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [2] },
    ]);

    table.currentScheduleCellIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(
      createExpectedResult({ dayNumber: 1, start: [9, 45], end: [11, 0] }),
    );

    table.currentScheduleCellIndex = 2;
    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(
      createExpectedResult({ dayNumber: 1, start: [9, 0], end: [10, 15] }),
    );
  });

  it('returns true when only one cell is occupied', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for multiple non-overlapping occupied cells across multiple days', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [3] },
    ]);

    acceptAllNonEmpty(table);
  });

  it('returns true for only one', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 45], end: [11, 0] }, clientIdsInvolved: [4] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 15], end: [11, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [5] },
      { timeInterval: { dayNumber: 1, start: [11, 15], end: [12, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [6] },
      { timeInterval: { dayNumber: 1, start: [11, 45], end: [13, 0] }, clientIdsInvolved: [] },
    ]);
    const expectedResults: Array<Result | null> = [
      createExpectedResult({ dayNumber: 1, start: [9, 0], end: [10, 15] }),
      createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] }),
      null,
      null,
      // first it finds the 0-indexed cell, so it'll calculate from that one
      createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] }),
      null,
      null,
      null,
      null,
      createExpectedResult(true),
      null,
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [12, 45], end: [14, 0] }),
      null,
      createExpectedResult({ dayNumber: 1, start: [12, 15], end: [13, 30] }),
      null,
    ];
    testDetailed(table, expectedResults);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2, 3] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 45], end: [11, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [4] },
      { timeInterval: { dayNumber: 1, start: [10, 15], end: [11, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 15], end: [12, 30] }, clientIdsInvolved: [5] },
      { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 45], end: [13, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 0], end: [13, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 15], end: [13, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 30], end: [13, 45] }, clientIdsInvolved: [6] },
    ]);
    acceptAllNonEmpty(table);
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2, 3] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [4] },
      { timeInterval: { dayNumber: 1, start: [11, 15], end: [12, 30] }, clientIdsInvolved: [5] },
      { timeInterval: { dayNumber: 1, start: [12, 30], end: [13, 45] }, clientIdsInvolved: [6] },
    ]);
    acceptAllNonEmpty(table);
  });

  describe('first-middle-last', () => {
    describe('scenario 1: initially overlapping with both', () => {
      it('return false, for the middle due to surroundings', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [2] },
          { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [3] },
        ]);

        table.currentScheduleCellIndex = 1;
        const expectedResult = createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] });
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });

      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
          { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [3] },
        ]);

        table.currentScheduleCellIndex = 1;
        const expectedInterval: TimeInterval = { dayNumber: 1, start: [10, 30], end: [11, 45] };
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });

      it('returns true for last', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [3] },
          {
            timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] },
            clientIdsInvolved: [2],
          },
        ]);

        table.currentScheduleCellIndex = 2;
        const expectedResult = createExpectedResult(true);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });
    });

    describe('scenario 2: initially overlapping with first one', () => {
      it('returns false for middle due to first one', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 45] }, clientIdsInvolved: [2] },
          { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [3] },
        ]);

        table.currentScheduleCellIndex = 1;
        const expectedResult = createExpectedResult({ dayNumber: 1, start: [8, 45], end: [10, 0] });
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });

      it('returns false for middle due to first one', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
          { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [3] },
        ]);

        table.currentScheduleCellIndex = 1;
        const expectedInterval: TimeInterval = { dayNumber: 1, start: [10, 45], end: [12, 0] };
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });

      it('returns true', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [3] },
          { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [2] },
        ]);

        table.currentScheduleCellIndex = 2;
        const expectedResult = createExpectedResult(true);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });
    });

    describe('scenario 3: initially overlapping with latter one', () => {
      it('returns false for middle due to latter one', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [2] },
          { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [3] },
        ]);

        table.currentScheduleCellIndex = 1;
        const expectedInterval: TimeInterval = { dayNumber: 1, start: [10, 45], end: [12, 0] };
        const expectedResult = createExpectedResult(expectedInterval);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });
      it('returns true', () => {
        const table = makeTable([
          { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
          { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [3] },
          { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [2] },
        ]);

        table.currentScheduleCellIndex = 2;
        const expectedResult = createExpectedResult(true);
        expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResult);
      });
    });
  });

  it('returns false for all, except last one', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [4] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [5] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [6] },
      { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [7] },
      { timeInterval: { dayNumber: 1, start: [9, 45], end: [11, 0] }, clientIdsInvolved: [8] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [9] },
      // all of them were before
      { timeInterval: { dayNumber: 1, start: [10, 15], end: [11, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 45], end: [12, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 15], end: [12, 30] }, clientIdsInvolved: [10] },
      { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [11, 45], end: [13, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 0], end: [13, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 15], end: [13, 30] }, clientIdsInvolved: [11] },
      { timeInterval: { dayNumber: 1, start: [12, 30], end: [13, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [12, 45], end: [14, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [13, 0], end: [14, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [13, 15], end: [14, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [13, 30], end: [14, 45] }, clientIdsInvolved: [12] },
      { timeInterval: { dayNumber: 1, start: [13, 45], end: [15, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [14, 0], end: [15, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [14, 15], end: [15, 30] }, clientIdsInvolved: [13] },
      { timeInterval: { dayNumber: 1, start: [14, 30], end: [15, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [14, 45], end: [16, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [15, 0], end: [16, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [15, 15], end: [16, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [15, 30], end: [16, 45] }, clientIdsInvolved: [14] },
      { timeInterval: { dayNumber: 1, start: [15, 45], end: [17, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 15] }, clientIdsInvolved: [15] },
      { timeInterval: { dayNumber: 1, start: [16, 15], end: [17, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [16, 30], end: [17, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [16, 45], end: [18, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [17, 0], end: [18, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [17, 15], end: [18, 30] }, clientIdsInvolved: [16] },
      { timeInterval: { dayNumber: 1, start: [17, 30], end: [18, 45] }, clientIdsInvolved: [17] },
      { timeInterval: { dayNumber: 1, start: [17, 45], end: [19, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [18, 0], end: [19, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [18, 15], end: [19, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [18, 30], end: [19, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [18, 45], end: [20, 0] }, clientIdsInvolved: [18] },
      { timeInterval: { dayNumber: 1, start: [19, 0], end: [20, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [19, 15], end: [20, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [19, 30], end: [20, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [19, 45], end: [21, 0] }, clientIdsInvolved: [] },
    ]);
    testDetailed(table, [
      createExpectedResult({ dayNumber: 1, start: [9, 30], end: [10, 45] }),
      createExpectedResult({ dayNumber: 1, start: [9, 15], end: [10, 30] }),
      createExpectedResult({ dayNumber: 1, start: [9, 15], end: [10, 30] }),
      createExpectedResult({ dayNumber: 1, start: [9, 15], end: [10, 30] }),
      createExpectedResult({ dayNumber: 1, start: [9, 15], end: [10, 30] }),
      createExpectedResult({ dayNumber: 1, start: [9, 30], end: [10, 45] }),
      createExpectedResult({ dayNumber: 1, start: [9, 45], end: [11, 0] }),
      createExpectedResult({ dayNumber: 1, start: [10, 0], end: [11, 15] }),
      createExpectedResult({ dayNumber: 1, start: [10, 15], end: [11, 30] }),
      null,
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [13, 30], end: [14, 45] }),
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [12, 30], end: [13, 45] }),
      null,
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [15, 30], end: [16, 45] }),
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [14, 45], end: [16, 0] }),
      null,
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [17, 15], end: [18, 30] }),
      null,
      createExpectedResult({ dayNumber: 1, start: [16, 45], end: [18, 0] }),
      null,
      null,
      null,
      null,
      createExpectedResult({ dayNumber: 1, start: [18, 45], end: [20, 0] }),
      createExpectedResult({ dayNumber: 1, start: [18, 30], end: [19, 45] }),
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
