import { TimeManager } from '../../../TimeManager';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { MorningChecker } from '../rules/MorningChecker';
import { LunchSpecification } from '../rules/LunchSpecification';
import { makeTable, selectForSpec } from './SpecificationTestHelper';

// TODO: 2 overlapping with and without morning sessions
describe(LunchSpecification.name, () => {
  let unitUnderTest: LunchSpecification;

  beforeEach(() => {
    const timeManager = new TimeManager();
    unitUnderTest = new LunchSpecification(
      new MorningChecker(timeManager),
      new TimeIntervalManager(timeManager),
    );
  });

  it('returns true when less than 4 occupied sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when no sessions fall within lunch period', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [11, 45], end: [13, 0] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when two sessions within lunch are separated by >= 60 minutes', () => {
    // morning session
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [12, 0], end: [13, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [14, 30], end: [15, 30] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when two sessions within lunch are separated by < 60 minutes', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [12, 45], end: [13, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [13, 45], end: [14, 15] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [15, 0], end: [16, 0] }, clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('respects morningChecker by choosing later lunch period for morning sessions', () => {
    // make the first session early morning so morningChecker.isMorningSession is true
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [13, 45], end: [14, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [14, 45], end: [15, 15] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
    ]);

    // For morning sessions lunch period is 13:30-15:00; sessions at 13:45 and 14:45 overlap the adjusted window
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  // ----- Detailed single-overlap cases (from TODO) -----
  describe('single overlapping session edge-cases (morning first session)', () => {
    // morning => lunch period 13:30-15:00
    it('only overlapping that ends at 14:00 -> true', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [13, 30], end: [14, 0] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that ends at 14:15 -> false', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [13, 30], end: [14, 15] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that starts at 14:30 -> true', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [14, 30], end: [15, 0] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that starts at 14:15 -> false', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [14, 15], end: [15, 0] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
    });
  });

  describe('single overlapping session edge-cases (non-morning first session)', () => {
    // non-morning => lunch period 13:00-14:30
    it('only overlapping that ends at 13:30 -> true', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [13, 0], end: [13, 30] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that ends at 13:45 -> false', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [13, 0], end: [13, 45] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that starts at 14:00 -> true', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [14, 0], end: [14, 30] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    });

    it('only overlapping that starts at 13:45 -> false', () => {
      const table = makeTable([
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 0] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 1, start: [13, 45], end: [14, 30] }, clientIdsInvolved: [3] },
        { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
      ]);

      expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
    });
  });
});
