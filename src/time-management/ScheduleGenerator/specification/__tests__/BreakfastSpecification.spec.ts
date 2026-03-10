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

  it('returns true when only one occupied cell (no need for breakfast room) but with multiple cells', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(true));
  });

  it('returns true when the changed cell is not in the first two occupied', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [8, 15], [9, 30]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 30], [9, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 15], [11, 30]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [] },
    ]);

    expect(unitUnderTest.check(table, 9)).toEqual(createExpectedResult(true));
  });

  it('returns true when there is enough gap for breakfast between first two sessions', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(true));
  });

  describe('false: there is not enough gap for breakfast between first two sessions', () => {
    it('returns false with half-hour gap', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [9, 45], [11, 0]), clientIdsInvolved: [2] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 11, 0)));
      expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(makeWeekTime(1, 10, 0)));
    });

    it('returns false with half-hour gap and exactly at the edge of morning', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 45], [10, 0]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [2] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(makeWeekTime(1, 11, 45)));
      expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(makeWeekTime(1, 10, 45)));
    });
  });

  it('ignores days where first session is not in the morning', () => {
    // first session starts after 08:45 so no breakfast constraint
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [2] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    expect(unitUnderTest.check(table, 1)).toEqual(createExpectedResult(true));
  });
});
