import { beforeEach, describe, it, expect } from 'vitest';
import { NoOverlappingSessionsSpecification } from '../rules/NoOverlappingSessionsSpecification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { methodName } from '../../../../utils/test-name';
import { createExpectedResult, makeTable, selectForSpec } from './SpecificationTestHelper';
import { TimeManager } from '../../../TimeManager';
import { Table } from '../../Table';
import { Result } from '../specification';

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
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      table.currentScheduleCellIndex = i;
      expect(unitUnderTest.check(...selectForSpec(table))).toEqual(expectedResults[i]);
    }
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
    const expectedResults: Array<Result | null> = [
      /*07:30*/ createExpectedResult(true),
      /*07:45*/ null,
      /*08:00*/ null,
      /*08:15*/ null,
      /*08:30*/ null,
      /*08:45*/ createExpectedResult(true),
      /*09:00*/ null,
      /*09:15*/ null,
      /*09:30*/ null,
      /*09:45*/ null,
      /*10:00*/ createExpectedResult(true),
      /*10:15*/ null,
      /*10:30*/ null,
      /*10:45*/ null,
      /*11:00*/ null,
      /*11:15*/ createExpectedResult(true),
      /*11:30*/ null,
      /*11:45*/ null,
      /*12:00*/ null,
      /*12:15*/ null,
      /*12:30*/ createExpectedResult(true),
    ];
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      table.currentScheduleCellIndex = i;
      expect(unitUnderTest.check(...selectForSpec(table)), `wrong at ${i}`).toEqual(
        expectedResults[i],
      );
    }
  });

  it('returns true for all occupied cells (mixed with non-occupied cells)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2, 3] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [4] },
      { timeInterval: { dayNumber: 1, start: [11, 15], end: [12, 30] }, clientIdsInvolved: [5] },
      { timeInterval: { dayNumber: 1, start: [12, 30], end: [13, 45] }, clientIdsInvolved: [6] },
    ]);
    const expectedResults: Array<Result | null> = [
      /*07:30*/ createExpectedResult(true),
      /*08:45*/ createExpectedResult(true),
      /*10:00*/ createExpectedResult(true),
      /*11:15*/ createExpectedResult(true),
      /*12:30*/ createExpectedResult(true),
    ];
    for (let i = 0; i < expectedResults.length; i++) {
      if (expectedResults[i] === null) continue;
      table.currentScheduleCellIndex = i;
      expect(unitUnderTest.check(...selectForSpec(table)), `wrong at ${i}`).toEqual(
        expectedResults[i],
      );
    }
  });
});
