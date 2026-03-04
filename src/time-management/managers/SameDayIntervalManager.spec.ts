import { SameDayIntervalManager } from './SameDayIntervalManager';
import { SameDayInterval } from '../definition/TimeInterval';
import { methodName } from '../../utils/test-name';
import { makeSameDayInterval } from '../definition/TimeInterval';
import { TimeManager } from './TimeManager';
import { TimeMapper } from '../mappers/TimeMapper';

describe(SameDayIntervalManager.name, () => {
  let unitUnderTest: SameDayIntervalManager;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    unitUnderTest = new SameDayIntervalManager(new TimeManager(timeMapper), timeMapper);
  });

  describe(methodName(SameDayIntervalManager, 'areIntervalsOverlapping'), () => {
    it('returns false for intervals on different days', () => {
      const a: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);
      const b: SameDayInterval = makeSameDayInterval(2, [8, 0], [9, 0]);

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(false);
    });

    it('returns true for identical intervals on same day', () => {
      const a: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);
      const b: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(true);
    });

    it('detects partial overlaps', () => {
      const earlier: SameDayInterval = makeSameDayInterval(1, [8, 0], [10, 0]);
      const later: SameDayInterval = makeSameDayInterval(1, [9, 0], [11, 0]);

      expect(unitUnderTest.areIntervalsOverlapping(earlier, later)).toBe(true);
      expect(unitUnderTest.areIntervalsOverlapping(later, earlier)).toBe(true);
    });

    it('treats include as overlap', () => {
      const includer: SameDayInterval = makeSameDayInterval(1, [8, 0], [12, 0]);
      const includee: SameDayInterval = makeSameDayInterval(1, [9, 0], [11, 0]);

      expect(unitUnderTest.areIntervalsOverlapping(includer, includee)).toBe(true);
      expect(unitUnderTest.areIntervalsOverlapping(includee, includer)).toBe(true);
    });

    it('does not treat touching intervals as overlapping', () => {
      const a: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);
      const b: SameDayInterval = makeSameDayInterval(1, [9, 0], [10, 0]);

      expect(unitUnderTest.areIntervalsOverlapping(a, b)).toBe(false);
      expect(unitUnderTest.areIntervalsOverlapping(b, a)).toBe(false);
    });
  });

  describe(methodName(SameDayIntervalManager, 'doesFirstIncludeSecond'), () => {
    it('returns true when first fully contains second but not other way around', () => {
      const outer: SameDayInterval = makeSameDayInterval(1, [7, 0], [12, 0]);
      const inner: SameDayInterval = makeSameDayInterval(1, [8, 0], [10, 0]);

      expect(unitUnderTest.doesFirstIncludeSecond(outer, inner)).toBe(true);
      expect(unitUnderTest.doesFirstIncludeSecond(inner, outer)).toBe(false);
    });
    it('returns false when they are on different day', () => {
      const bigger: SameDayInterval = makeSameDayInterval(1, [7, 0], [12, 0]);
      const smaller: SameDayInterval = makeSameDayInterval(2, [8, 0], [10, 0]);

      expect(unitUnderTest.doesFirstIncludeSecond(bigger, smaller)).toBe(false);
      expect(unitUnderTest.doesFirstIncludeSecond(smaller, bigger)).toBe(false);
    });
    it('returns false when they overlap but not include one other', () => {
      const earlier: SameDayInterval = makeSameDayInterval(1, [7, 0], [10, 30]);
      const later: SameDayInterval = makeSameDayInterval(2, [9, 0], [10, 45]);

      expect(unitUnderTest.doesFirstIncludeSecond(earlier, later)).toBe(false);
      expect(unitUnderTest.doesFirstIncludeSecond(later, earlier)).toBe(false);
    });
  });

  describe(methodName(SameDayIntervalManager, 'shiftInterval'), () => {
    it('shiftInterval moves both start and end by the given minutes', () => {
      const interval: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 15]);
      const shifted = unitUnderTest.shiftInterval(interval, 15);

      expect(shifted).toEqual(makeSameDayInterval(1, [8, 15], [9, 30]));

      const shiftedBack = unitUnderTest.shiftInterval(interval, -30);
      expect(shiftedBack).toEqual(makeSameDayInterval(1, [7, 30], [8, 45]));
    });
    it('leaves as is when shifted by 0', () => {
      const original: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 15]);
      const shifted = unitUnderTest.shiftInterval(original, 0);
      expect(shifted).toEqual(original);
    });
  });

  describe(methodName(SameDayIntervalManager, 'shiftStart'), () => {
    it('shiftStart adjusts only the start time', () => {
      const interval: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);
      const shifted = unitUnderTest.shiftStart(interval, 30);
      expect(shifted).toEqual(makeSameDayInterval(1, [8, 30], [9, 0]));

      const shiftedBack = unitUnderTest.shiftStart(interval, -15);
      expect(shiftedBack).toEqual(makeSameDayInterval(1, [7, 45], [9, 0]));
    });
  });

  describe(methodName(SameDayIntervalManager, 'shiftEnd'), () => {
    it('shiftEnd adjusts only the end time', () => {
      const interval: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 0]);
      const shifted = unitUnderTest.shiftEnd(interval, 15);
      expect(shifted).toEqual(makeSameDayInterval(1, [8, 0], [9, 15]));

      const shiftedBack = unitUnderTest.shiftEnd(interval, -30);
      expect(shiftedBack).toEqual(makeSameDayInterval(1, [8, 0], [8, 30]));
    });
  });

  describe(methodName(SameDayIntervalManager, 'getMinutesBetweenIntervals'), () => {
    it('returns minutes from earlier end to later start', () => {
      const earlier: SameDayInterval = makeSameDayInterval(1, [9, 15], [10, 30]);
      const later: SameDayInterval = makeSameDayInterval(1, [11, 0], [12, 15]);

      expect(unitUnderTest.getMinutesBetweenIntervals(earlier, later)).toBe(30);
    });

    it('handles when overlaps', () => {
      const earlier: SameDayInterval = makeSameDayInterval(1, [9, 15], [10, 30]);
      const later: SameDayInterval = makeSameDayInterval(1, [10, 15], [11, 30]);

      expect(unitUnderTest.getMinutesBetweenIntervals(earlier, later)).toBe(-15);
    });
  });

  describe(methodName(SameDayIntervalManager, 'shiftByGranularity'), () => {
    it('should shift interval by 15 mins', () => {
      const interval: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 15]);
      const shifted = unitUnderTest.shiftByGranularity(interval);
      expect(shifted).toEqual(makeSameDayInterval(1, [8, 15], [9, 30]));
    });
  });

  describe(methodName(SameDayIntervalManager, 'shiftBySessionLength'), () => {
    it('should shift interval by 75 mins', () => {
      const interval: SameDayInterval = makeSameDayInterval(1, [8, 0], [9, 15]);
      const shifted = unitUnderTest.shiftBySessionLength(interval);
      expect(shifted).toEqual(makeSameDayInterval(1, [9, 15], [10, 30]));
    });
  });

  describe(methodName(SameDayIntervalManager, 'isIntervalAtOrAfterBase'), () => {
    it('identical intervals (equal starts and ends) => true', () => {
      const examined = makeSameDayInterval(2, [9, 15], [10, 30]);
      const base = makeSameDayInterval(2, [9, 15], [10, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('same object reference => true', () => {
      const examined = makeSameDayInterval(2, [9, 15], [10, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, examined)).toBe(true);
    });

    it('interval earlier day => false', () => {
      const examined = makeSameDayInterval(1, [9, 0], [10, 0]);
      const base = makeSameDayInterval(2, [9, 0], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
    });

    it('interval later day => true', () => {
      const examined = makeSameDayInterval(3, [9, 0], [10, 0]);
      const base = makeSameDayInterval(2, [9, 0], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('same day, starts equal, interval ends earlier => true', () => {
      const examined = makeSameDayInterval(2, [9, 15], [9, 45]);
      const base = makeSameDayInterval(2, [9, 15], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('same day, starts equal, interval ends later => true', () => {
      const examined = makeSameDayInterval(2, [9, 15], [11, 0]);
      const base = makeSameDayInterval(2, [9, 15], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('same day, interval starts after second start (strictly greater) => true', () => {
      const examined = makeSameDayInterval(2, [10, 0], [11, 0]);
      const base = makeSameDayInterval(2, [9, 30], [10, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('same day, interval starts before second start (strictly less) => false', () => {
      const examined = makeSameDayInterval(2, [8, 0], [9, 30]);
      const base = makeSameDayInterval(2, [9, 0], [9, 15]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
    });

    it('same day, interval starts before but overlaps second => false', () => {
      const examined = makeSameDayInterval(2, [9, 0], [11, 0]);
      const base = makeSameDayInterval(2, [9, 30], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
    });

    it('same day, interval starts after second and non-overlapping later => true', () => {
      const examined = makeSameDayInterval(2, [11, 0], [11, 30]);
      const base = makeSameDayInterval(2, [9, 0], [9, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('boundary minute precision one minute before => false', () => {
      const examined = makeSameDayInterval(2, [9, 14], [9, 45]);
      const base = makeSameDayInterval(2, [9, 15], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
    });

    it('boundary minute precision one minute after => true', () => {
      const examined = makeSameDayInterval(2, [9, 16], [9, 45]);
      const base = makeSameDayInterval(2, [9, 15], [10, 0]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('midnight boundary equal starts => true', () => {
      const examined = makeSameDayInterval(2, [0, 0], [1, 0]);
      const base = makeSameDayInterval(2, [0, 0], [0, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });

    it('different-day adjacency previous day vs next day => false', () => {
      const examined = makeSameDayInterval(6, [23, 59], [23, 59]);
      const base = makeSameDayInterval(7, [0, 0], [0, 1]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
    });

    it('large gap same day start comparison only => true', () => {
      const examined = makeSameDayInterval(2, [23, 0], [23, 30]);
      const base = makeSameDayInterval(2, [0, 0], [0, 30]);
      expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
    });
  });
});
