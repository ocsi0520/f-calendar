import { NoOverlappingSessionsSpecification } from '../rules/NoOverlappingSessionsSpecification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table } from '../../Table';
import { methodName } from '../../../../utils/test-name';
import { TestBed } from '@angular/core/testing';

describe(methodName(NoOverlappingSessionsSpecification, 'check'), () => {
  let unitUnderTest: NoOverlappingSessionsSpecification;
  let timeIntervalManager: TimeIntervalManager;

  beforeEach(() => {
    timeIntervalManager = TestBed.inject(TimeIntervalManager);
    unitUnderTest = new NoOverlappingSessionsSpecification(timeIntervalManager);
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

  it('returns true when no items are occupied (empty clientIdsInvolved)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when two items are adjacent', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when occupied items do not overlap on the same day', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when occupied items are exactly adjacent (no overlap)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when occupied items are on different days', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when occupied items overlap: first starts before second ends', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [9, 45] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns false when occupied items overlap: second starts before first ends', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [10, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [9, 0] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns true with mixed occupied and unoccupied items when no overlaps exist', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 0], end: [8, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when occupied items overlap even with unoccupied items between them', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 30], end: [10, 45] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns true when only one item is occupied', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true for multiple non-overlapping occupied items across multiple days', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });
});
