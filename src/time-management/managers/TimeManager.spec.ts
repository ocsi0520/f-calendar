import { describe, it, expect, beforeEach } from 'vitest';
import { TimeManager } from './TimeManager';
import { TimeMapper } from '../mappers/TimeMapper';
import { makeWeekTime, WeekTime } from '../definition/WeekTime';
import { methodName } from '../../utils/test-name';

describe(TimeManager.name, () => {
  let unitUnderTest: TimeManager;

  beforeEach(() => {
    unitUnderTest = new TimeManager(new TimeMapper());
  });

  describe(methodName(TimeManager, 'isAtOrAfter'), () => {
    it('returns true when times are equal', () => {
      const base: WeekTime = { dayNumber: 3, hour: 12, minute: 0 };
      const same: WeekTime = { dayNumber: 3, hour: 12, minute: 0 };

      expect(unitUnderTest.isAtOrAfter(same, base)).toBe(true);
    });

    it('returns true when time is after base', () => {
      const base: WeekTime = { dayNumber: 3, hour: 12, minute: 0 };
      const after: WeekTime = { dayNumber: 3, hour: 12, minute: 1 };

      expect(unitUnderTest.isAtOrAfter(after, base)).toBe(true);
    });

    it('returns false when time is before base', () => {
      const base: WeekTime = { dayNumber: 3, hour: 12, minute: 0 };
      const before: WeekTime = { dayNumber: 3, hour: 11, minute: 59 };

      expect(unitUnderTest.isAtOrAfter(before, base)).toBe(false);
    });
  });

  describe(methodName(TimeManager, 'isAfter'), () => {
    it('returns false when times are equal', () => {
      const base: WeekTime = { dayNumber: 2, hour: 8, minute: 30 };
      const same: WeekTime = { dayNumber: 2, hour: 8, minute: 30 };

      expect(unitUnderTest.isAfter(same, base)).toBe(false);
    });

    it('returns true when time is strictly after base', () => {
      const base: WeekTime = { dayNumber: 2, hour: 8, minute: 30 };
      const after: WeekTime = { dayNumber: 2, hour: 8, minute: 31 };

      expect(unitUnderTest.isAfter(after, base)).toBe(true);
    });

    it('returns false when time is before base', () => {
      const base: WeekTime = { dayNumber: 3, hour: 15, minute: 0 };
      const before: WeekTime = { dayNumber: 3, hour: 14, minute: 59 };

      expect(unitUnderTest.isAfter(before, base)).toBe(false);
    });
  });

  describe(methodName(TimeManager, 'isSame'), () => {
    it('returns true when times are identical', () => {
      const base: WeekTime = { dayNumber: 7, hour: 23, minute: 59 };
      const same: WeekTime = { dayNumber: 7, hour: 23, minute: 59 };

      expect(unitUnderTest.isSame(same, base)).toBe(true);
    });

    it('returns false when times differ by minute', () => {
      const base: WeekTime = { dayNumber: 1, hour: 0, minute: 0 };
      const different: WeekTime = { dayNumber: 1, hour: 0, minute: 1 };

      expect(unitUnderTest.isSame(different, base)).toBe(false);
    });

    it('returns false when times differ by day', () => {
      const base: WeekTime = { dayNumber: 1, hour: 10, minute: 0 };
      const different: WeekTime = { dayNumber: 2, hour: 10, minute: 0 };

      expect(unitUnderTest.isSame(different, base)).toBe(false);
    });
  });

  describe('shifts', () => {
    const normalCase = makeWeekTime(2, 10, 45);
    const edgeCase = makeWeekTime(2, 23, 45);
    it('should handle ' + methodName(TimeManager, 'shiftByGranularity'), () => {
      expect(unitUnderTest.shiftByGranularity(normalCase)).toEqual(makeWeekTime(2, 11, 0));
      expect(unitUnderTest.shiftByGranularity(edgeCase)).toEqual(makeWeekTime(3, 0, 0));
    });
    it('should handle ' + methodName(TimeManager, 'shiftBySessionLength'), () => {
      expect(unitUnderTest.shiftBySessionLength(normalCase)).toEqual(makeWeekTime(2, 12, 0));
      expect(unitUnderTest.shiftBySessionLength(edgeCase)).toEqual(makeWeekTime(3, 1, 0));
    });
    it('should handle ' + methodName(TimeManager, 'shift') + ' with positive and 0 values', () => {
      expect(unitUnderTest.shift(normalCase, 0)).toEqual(normalCase);
      expect(unitUnderTest.shift(normalCase, 1)).toEqual(makeWeekTime(2, 10, 46));
      expect(unitUnderTest.shift(normalCase, 30)).toEqual(makeWeekTime(2, 11, 15));
      expect(unitUnderTest.shift(normalCase, 120)).toEqual(makeWeekTime(2, 12, 45));

      expect(unitUnderTest.shift(edgeCase, 0)).toEqual(edgeCase);
      expect(unitUnderTest.shift(edgeCase, 1)).toEqual(makeWeekTime(2, 23, 46));
      expect(unitUnderTest.shift(edgeCase, 30)).toEqual(makeWeekTime(3, 0, 15));
      expect(unitUnderTest.shift(edgeCase, 120)).toEqual(makeWeekTime(3, 1, 45));
    });
    it('should handle ' + methodName(TimeManager, 'shift') + ' with negative values', () => {
      expect(unitUnderTest.shift(normalCase, -0)).toEqual(normalCase);
      expect(unitUnderTest.shift(normalCase, -1)).toEqual(makeWeekTime(2, 10, 44));
      expect(unitUnderTest.shift(normalCase, -30)).toEqual(makeWeekTime(2, 10, 15));
      expect(unitUnderTest.shift(normalCase, -120)).toEqual(makeWeekTime(2, 8, 45));

      expect(unitUnderTest.shift(edgeCase, -0)).toEqual(edgeCase);
      expect(unitUnderTest.shift(edgeCase, -1)).toEqual(makeWeekTime(2, 23, 44));
      expect(unitUnderTest.shift(edgeCase, -30)).toEqual(makeWeekTime(2, 23, 15));
      expect(unitUnderTest.shift(edgeCase, -120)).toEqual(makeWeekTime(2, 21, 45));
      expect(unitUnderTest.shift(edgeCase, -24 * 60)).toEqual(makeWeekTime(1, 23, 45));
    });
  });
});
