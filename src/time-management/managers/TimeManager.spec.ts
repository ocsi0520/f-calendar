import { describe, it, expect, beforeEach } from 'vitest';
import { TimeManager } from './TimeManager';
import { TimeMapper } from '../mappers/TimeMapper';
import { WeekTime } from '../definition/WeekTime';

describe('TimeManager', () => {
  let unitUnderTest: TimeManager;

  beforeEach(() => {
    unitUnderTest = new TimeManager(new TimeMapper());
  });

  describe('isAtOrAfter', () => {
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

  describe('isAfter', () => {
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

  describe('isSame', () => {
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
});
