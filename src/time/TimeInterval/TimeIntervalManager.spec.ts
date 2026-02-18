import { TestBed } from '@angular/core/testing';
import { TimeIntervalManager } from './TimeIntervalManager';
import { TimeManager } from '../TimeManager';
import { TimeInterval, isSameInterval } from './TimeInterval';
import { methodName } from '../../utils/test-name';

describe(TimeIntervalManager.name, () => {
  let unitUnderTest: TimeIntervalManager;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TimeIntervalManager, TimeManager] });
    unitUnderTest = TestBed.inject(TimeIntervalManager);
  });

  // Inline TimeInterval objects using `Hour` and `Minute` types
  describe(methodName(TimeIntervalManager, 'areIntervalsOverlapping'), () => {
    it('returns false for intervals on different days', () => {
      const a: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const b: TimeInterval = { dayNumber: 2, start: [8, 0], end: [9, 0] };

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(false);
    });

    it('returns true for identical intervals on same day', () => {
      const a: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const b: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(true);
    });

    it('detects partial overlaps', () => {
      const earlier: TimeInterval = { dayNumber: 1, start: [8, 0], end: [10, 0] };
      const later: TimeInterval = { dayNumber: 1, start: [9, 0], end: [11, 0] };

      expect(unitUnderTest.areIntervalsOverlapping(earlier, later)).toBe(true);
      expect(unitUnderTest.areIntervalsOverlapping(later, earlier)).toBe(true);
    });

    it('treats include as overlap', () => {
      const includer: TimeInterval = { dayNumber: 1, start: [8, 0], end: [12, 0] };
      const includee: TimeInterval = { dayNumber: 1, start: [9, 0], end: [11, 0] };

      expect(unitUnderTest.areIntervalsOverlapping(includer, includee)).toBe(true);
      expect(unitUnderTest.areIntervalsOverlapping(includee, includer)).toBe(true);
    });

    it('does not treat touching intervals as overlapping', () => {
      const a: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const b: TimeInterval = { dayNumber: 1, start: [9, 0], end: [10, 0] };

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(false);
      expect(unitUnderTest.areIntervalsOverlapping(b, a)).toBe(false);
    });
  });

  describe(methodName(TimeIntervalManager, 'doesFirstIncludeSecond'), () => {
    it('returns true when first fully contains second but not other way around', () => {
      const outer: TimeInterval = { dayNumber: 1, start: [7, 0], end: [12, 0] };
      const inner: TimeInterval = { dayNumber: 1, start: [8, 0], end: [10, 0] };

      expect(unitUnderTest.doesFirstIncludeSecond(outer, inner)).toBe(true);
      expect(unitUnderTest.doesFirstIncludeSecond(inner, outer)).toBe(false);
    });
    it('returns false when they are on different day', () => {
      const bigger: TimeInterval = { dayNumber: 1, start: [7, 0], end: [12, 0] };
      const smaller: TimeInterval = { dayNumber: 2, start: [8, 0], end: [10, 0] };

      expect(unitUnderTest.doesFirstIncludeSecond(bigger, smaller)).toBe(false);
      expect(unitUnderTest.doesFirstIncludeSecond(smaller, bigger)).toBe(false);
    });
    it('returns false when they overlap but not include one other', () => {
      const earlier: TimeInterval = { dayNumber: 1, start: [7, 0], end: [10, 30] };
      const later: TimeInterval = { dayNumber: 2, start: [9, 0], end: [10, 45] };

      expect(unitUnderTest.doesFirstIncludeSecond(earlier, later)).toBe(false);
      expect(unitUnderTest.doesFirstIncludeSecond(later, earlier)).toBe(false);
    });
  });

  describe(methodName(TimeIntervalManager, 'shiftInterval'), () => {
    it('shiftInterval moves both start and end by the given minutes', () => {
      const interval: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 15] };
      const shifted = unitUnderTest.shiftInterval(interval, 15);

      expect(isSameInterval(shifted, { dayNumber: 1, start: [8, 15], end: [9, 30] })).toBe(true);

      const shiftedBack = unitUnderTest.shiftInterval(interval, -30);
      expect(isSameInterval(shiftedBack, { dayNumber: 1, start: [7, 30], end: [8, 45] })).toBe(
        true,
      );
    });
    it('leaves as is when shifted by 0', () => {
      const original: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 15] };
      const shifted = unitUnderTest.shiftInterval(original, 0);
      expect(isSameInterval(shifted, original)).toBe(true);
    });
  });

  describe(methodName(TimeIntervalManager, 'shiftStart'), () => {
    it('shiftStart adjusts only the start time', () => {
      const interval: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const shifted = unitUnderTest.shiftStart(interval, 30);
      expect(isSameInterval(shifted, { dayNumber: 1, start: [8, 30], end: [9, 0] })).toBe(true);

      const shiftedBack = unitUnderTest.shiftStart(interval, -15);
      expect(isSameInterval(shiftedBack, { dayNumber: 1, start: [7, 45], end: [9, 0] })).toBe(true);
    });
  });

  describe(methodName(TimeIntervalManager, 'shiftEnd'), () => {
    it('shiftEnd adjusts only the end time', () => {
      const interval: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const shifted = unitUnderTest.shiftEnd(interval, 15);
      expect(isSameInterval(shifted, { dayNumber: 1, start: [8, 0], end: [9, 15] })).toBe(true);

      const shiftedBack = unitUnderTest.shiftEnd(interval, -30);
      expect(isSameInterval(shiftedBack, { dayNumber: 1, start: [8, 0], end: [8, 30] })).toBe(true);
    });
  });

  describe(methodName(TimeIntervalManager, 'getMinutesBetweenIntervals'), () => {
    it('returns minutes from earlier end to later start', () => {
      const earlier: TimeInterval = { dayNumber: 1, start: [9, 15], end: [10, 30] };
      const later: TimeInterval = { dayNumber: 1, start: [11, 0], end: [12, 15] };

      expect(unitUnderTest.getMinutesBetweenIntervals(earlier, later)).toBe(30);
    });

    it('handles when overlaps', () => {
      const earlier: TimeInterval = { dayNumber: 1, start: [9, 15], end: [10, 30] };
      const later: TimeInterval = { dayNumber: 1, start: [10, 15], end: [11, 30] };

      expect(unitUnderTest.getMinutesBetweenIntervals(earlier, later)).toBe(-15);
    });
  });
});
