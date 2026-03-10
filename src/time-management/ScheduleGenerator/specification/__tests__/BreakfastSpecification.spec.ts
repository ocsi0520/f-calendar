import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { makeWeekTime } from '../../../definition/WeekTime';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { TimeMapper } from '../../../mappers/TimeMapper';
import { BreakfastSpecification } from '../rules/BreakfastSpecification';
import { MorningChecker } from '../rules/MorningChecker';
import { createExpectedResult, makeTable } from './SpecificationTestHelper';

describe('BreakfastSpecification.check', () => {
  let unitUnderTest: BreakfastSpecification;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    const timeManager = new TimeManager(timeMapper);
    const sameDayIntervalManager = new SameDayIntervalManager(timeManager, timeMapper);
    unitUnderTest = new BreakfastSpecification(
      sameDayIntervalManager,
      timeManager,
      new MorningChecker(),
    );
  });

  it('returns true when only one occupied cell (no need for breakfast room)', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
  });

  it('returns true when there is enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(true));
  });

  it('returns false when there is not enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(makeWeekTime(1, 10, 0)));
  });

  it('ignores days where first session is not in the morning', () => {
    // first session starts after 08:45 so no breakfast constraint
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 0]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 15]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(true));
  });
});
