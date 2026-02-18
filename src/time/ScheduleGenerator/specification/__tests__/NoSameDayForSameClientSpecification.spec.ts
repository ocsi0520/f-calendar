import { methodName } from '../../../../utils/test-name';
import { ScheduleItem, Table } from '../../Table';
import { NoSameDayForSameClientSpecification } from '../NoSameDayForSameClientSpecification';

describe(methodName(NoSameDayForSameClientSpecification, 'check'), () => {
  const unitUnderTest = new NoSameDayForSameClientSpecification();

  const makeTable = (scheduleItems: ScheduleItem[]): Table => ({
    clientInfos: [],
    currentClientIndex: 0,
    scheduleItems,
  });

  it('returns true when there are no schedule items', () => {
    const table = makeTable([]);
    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when no clients are assigned to any cells', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when same client appears on different days', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when multiple clients appear on same day but without duplication', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when the same client has multiple sessions on the same day', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [1] }, // duplicate same day
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns false when duplication occurs across different cells on the same day with multiple clients', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
      { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 2] }, // client 2 duplicated
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('ignores duplication across days but detects it within each individual day', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 0], end: [8, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 2, start: [7, 0], end: [8, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [1] }, // duplicate day 2
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });
  it('should handle case when client is registered twice', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 1] },
    ]);
    expect(unitUnderTest.check(table)).toBe(false);
  });
});
