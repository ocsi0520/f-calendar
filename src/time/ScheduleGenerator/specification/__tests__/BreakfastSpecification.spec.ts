import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { TimeManager } from '../../../TimeManager';
import { BreakfastSpecification } from '../rules/BreakfastSpecification';
import { MorningChecker } from '../rules/MorningChecker';
import { createExpectedResult, makeTable, selectForSpec } from './SpecificationTestHelper';

describe('BreakfastSpecification.check', () => {
  let unitUnderTest: BreakfastSpecification;

  beforeEach(() => {
    const timeManager = new TimeManager();
    unitUnderTest = new BreakfastSpecification(
      new TimeIntervalManager(timeManager),
      new MorningChecker(timeManager),
    );
  });

  it('returns true when only one occupied cell (no need for breakfast room)', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(createExpectedResult(true));
  });

  it('returns true when there is enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(createExpectedResult(true));
  });

  it('returns false when there is not enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 45], end: [11, 0] }, clientIdsInvolved: [2] },
    ]);
    table.currentScheduleItemIndex = 1;

    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(
      createExpectedResult({ dayNumber: 1, start: [10, 0], end: [11, 15] }),
    );
  });

  it('ignores days where first session is not in the morning', () => {
    // first session starts after 08:45 so no breakfast constraint
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toEqual(createExpectedResult(true));
  });
});
