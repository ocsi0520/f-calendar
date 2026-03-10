import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { makeWeekTime } from '../../../definition/WeekTime';
import { SameDayIntervalManager } from '../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../managers/TimeManager';
import { SameDayIntervalMapper } from '../../../mappers/SameDayIntervalMapper';
import { TimeMapper } from '../../../mappers/TimeMapper';
import { LunchSpecification } from '../rules/LunchSpecification';
import { MorningChecker } from '../rules/MorningChecker';
import { makeTable, createExpectedResult } from './SpecificationTestHelper';

// TODO: proper groups & check all possible scenarios:
// - under 4 sessions
// - breakfast, then 0 overlapping
// - breakfast, then 1 overlapping before
// - breakfast, then 1 overlapping after
// - breakfast, then 2 overlappings >= 60 mins diff
// - breakfast, then 2 overlappings < 60 mins diff
// - without breakfast, then 0 overlapping
// - without breakfast, then 1 overlapping before
// - without breakfast, then 1 overlapping after
// - without breakfast, then 2 overlappings >= 60 mins diff
// - without breakfast, then 2 overlappings < 60 mins diff
//  later w/ breakfast 13.30 - 15.00

//  earlier w/ out breakfast 13.00 - 14.30
describe(LunchSpecification.name, () => {
  let unitUnderTest: LunchSpecification;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    const timeManager = new TimeManager(timeMapper);
    const sameDayIntervalManager = new SameDayIntervalManager(timeManager, timeMapper);
    const morningChecker = new MorningChecker();
    unitUnderTest = new LunchSpecification(morningChecker, sameDayIntervalManager, timeManager);
  });

  it('returns true when less than 4 occupied sessions', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [9, 15], [10, 30]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(true));
  });

  it('returns true when no sessions fall within lunch period', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [10, 30], [11, 45]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [11, 45], [13, 0]), clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
  });

  it('returns true when two sessions within lunch are separated by >= 60 minutes', () => {
    // morning session
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 0]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [12, 0], [13, 15]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [14, 30], [15, 30]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [16, 0], [17, 0]), clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
  });

  it('returns false when two sessions within lunch are separated by < 60 minutes', () => {
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [12, 15], [13, 30]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [14, 0], [15, 15]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [16, 15], [17, 30]), clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 14, 15)));
  });

  it('respects morningChecker by choosing later lunch period for morning sessions', () => {
    // make the first session early morning so morningChecker.isMorningSession is true
    const table = makeTable([
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
      { timeInterval: makeSameDayInterval(1, [13, 15], [14, 30]), clientIdsInvolved: [2] },
      { timeInterval: makeSameDayInterval(1, [14, 45], [16, 0]), clientIdsInvolved: [3] },
      { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
    ]);

    // For morning sessions lunch period is 13:30-15:00; sessions at 13:45 and 14:45 overlap the adjusted window
    expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 15, 0)));
  });

  // ----- Detailed single-overlap cases (from TODO) -----
  describe('single overlapping session edge-cases (morning first session)', () => {
    // morning => lunch period 13:30-15:00
    it('only overlapping that ends at 14:00 -> true', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [12, 45], [14, 0]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    });

    it('only overlapping that ends at 14:15 -> false', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [13, 0], [14, 15]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 13, 15)));
    });

    it('only overlapping that starts at 14:30 -> true', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [14, 30], [15, 15]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 0]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    });

    it('only overlapping that starts at 14:15 -> false', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [14, 15], [15, 30]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 14, 30)));
    });
  });

  describe('single overlapping session edge-cases (non-morning first session)', () => {
    // non-morning => lunch period 13:00-14:30
    it('only overlapping that ends at 13:30 -> true', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [12, 15], [13, 30]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    });

    it('only overlapping that ends at 13:45 -> false', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [12, 30], [13, 45]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 12, 45)));
    });

    it('should return true, as can eat between 13.00-14.00', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [14, 0], [15, 15]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 15]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 0)).toEqual(createExpectedResult(true));
    });

    it('only overlapping that starts at 13:45 -> false', () => {
      const table = makeTable([
        { timeInterval: makeSameDayInterval(1, [9, 0], [10, 15]), clientIdsInvolved: [1] },
        { timeInterval: makeSameDayInterval(1, [11, 0], [12, 15]), clientIdsInvolved: [2] },
        { timeInterval: makeSameDayInterval(1, [13, 45], [15, 0]), clientIdsInvolved: [3] },
        { timeInterval: makeSameDayInterval(1, [16, 0], [17, 0]), clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(table, 2)).toEqual(createExpectedResult(makeWeekTime(1, 14, 0)));
    });
  });
});
