import { TimeManager } from '../../../TimeManager';
import { BreakfastSpecification } from '../BreakfastSpecification';
import { MorningChecker } from '../MorningChecker';
import { ScheduleItem, Table } from '../../Table';

describe('BreakfastSpecification.check', () => {
  let timeManager: TimeManager;
  let morningChecker: MorningChecker;
  let unitUnderTest: BreakfastSpecification;

  beforeEach(() => {
    timeManager = new TimeManager();
    morningChecker = new MorningChecker(timeManager);
    unitUnderTest = new BreakfastSpecification(timeManager, morningChecker);
  });

  const makeTable = (items: ScheduleItem[]): Table => ({ clientInfos: [], currentClientIndex: 0, scheduleItems: items });

  it('returns true when only one occupied cell (no need for breakfast room)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when there is enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when there is not enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 45], end: [11, 0] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('ignores days where first session is not in the morning', () => {
    // first session starts after 08:45 so no breakfast constraint
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });
});
