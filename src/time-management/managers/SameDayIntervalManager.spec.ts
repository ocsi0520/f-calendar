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

  describe(methodName(SameDayIntervalManager, 'isSameInterval'), () => {
    const baseInterval: SameDayInterval = makeSameDayInterval(3, [10, 15], [11, 30]);
    it('should return true for equal interval', () => {
      const equalInterval: SameDayInterval = makeSameDayInterval(3, [10, 15], [11, 30]);
      expect(unitUnderTest.isSameInterval(equalInterval, baseInterval)).true;
    });
    it('should return true for the same interval', () => {
      expect(unitUnderTest.isSameInterval(baseInterval, baseInterval)).true;
    });
    it('should return false for different day', () => {
      const interval: SameDayInterval = makeSameDayInterval(4, [10, 15], [11, 30]);
      expect(unitUnderTest.isSameInterval(interval, baseInterval)).false;
    });
    it('should return false for different hour', () => {
      const interval1: SameDayInterval = makeSameDayInterval(3, [11, 15], [11, 30]);
      expect(unitUnderTest.isSameInterval(interval1, baseInterval)).false;
      const interval2: SameDayInterval = makeSameDayInterval(3, [10, 15], [10, 30]);
      expect(unitUnderTest.isSameInterval(interval2, baseInterval)).false;
    });
    it('should return false for different minute', () => {
      const interval1: SameDayInterval = makeSameDayInterval(3, [10, 30], [11, 30]);
      expect(unitUnderTest.isSameInterval(interval1, baseInterval)).false;
      const interval2: SameDayInterval = makeSameDayInterval(3, [10, 15], [11, 45]);
      expect(unitUnderTest.isSameInterval(interval2, baseInterval)).false;
    });
    it('should return false for entirely different interval', () => {
      const interval: SameDayInterval = makeSameDayInterval(2, [9, 45], [11, 0]);
      expect(unitUnderTest.isSameInterval(interval, baseInterval)).false;
    });
  });

  describe(methodName(SameDayIntervalManager, 'isIntervalWithinSchedule'), () => {
    const aSchedule: Array<SameDayInterval> = [
      makeSameDayInterval(1, [10, 0], [11, 15]),
      makeSameDayInterval(1, [18, 0], [21, 0]),
      makeSameDayInterval(2, [10, 0], [12, 0]),
      makeSameDayInterval(2, [17, 30], [18, 45]),
      makeSameDayInterval(3, [10, 0], [18, 0]),
      makeSameDayInterval(5, [16, 0], [20, 0]),
    ];
    // same interval, adjacent-left, adjacent-right, overlap-left, overlap-right, first contains second, second contains first
    it('should return true, as two intervals are equal', () => {
      const interval: SameDayInterval = makeSameDayInterval(2, [17, 30], [18, 45]);
      expect(unitUnderTest.isIntervalWithinSchedule(interval, aSchedule)).true;
    });
    it('should return true, as interval is contained by a schedule component', () => {
      const fromLeft: SameDayInterval = makeSameDayInterval(1, [18, 0], [19, 15]);
      const fromRight: SameDayInterval = makeSameDayInterval(1, [19, 45], [21, 0]);
      const inMiddle: SameDayInterval = makeSameDayInterval(1, [18, 30], [19, 45]);
      expect(unitUnderTest.isIntervalWithinSchedule(fromLeft, aSchedule)).true;
      expect(unitUnderTest.isIntervalWithinSchedule(fromRight, aSchedule)).true;
      expect(unitUnderTest.isIntervalWithinSchedule(inMiddle, aSchedule)).true;
    });
    it('should return false, as interval contains a schedule component', () => {
      // base is 2-17.30-18.45
      const tooBigFromLeft: SameDayInterval = makeSameDayInterval(2, [17, 15], [18, 45]);
      const tooBigFromRight: SameDayInterval = makeSameDayInterval(2, [17, 30], [19, 0]);
      const tooBigInterval: SameDayInterval = makeSameDayInterval(2, [17, 15], [19, 0]);
      expect(unitUnderTest.isIntervalWithinSchedule(tooBigFromLeft, aSchedule)).false;
      expect(unitUnderTest.isIntervalWithinSchedule(tooBigFromRight, aSchedule)).false;
      expect(unitUnderTest.isIntervalWithinSchedule(tooBigInterval, aSchedule)).false;
    });
    it('should return false, as no interval in schedule has the same day', () => {
      const noSameDayInSchedule: SameDayInterval = makeSameDayInterval(4, [10, 0], [10, 15]);
      expect(unitUnderTest.isIntervalWithinSchedule(noSameDayInSchedule, aSchedule)).false;
    });

    it('should return false, as the interval is adjacent from left with a schedule component', () => {
      // 3-10.00-18.00
      const touchingAdjacentFromLeft: SameDayInterval = makeSameDayInterval(3, [8, 45], [10, 0]);
      expect(unitUnderTest.isIntervalWithinSchedule(touchingAdjacentFromLeft, aSchedule)).false;
      const nonTouchingAdjacentFromLeft: SameDayInterval = makeSameDayInterval(3, [8, 30], [9, 45]);
      expect(unitUnderTest.isIntervalWithinSchedule(nonTouchingAdjacentFromLeft, aSchedule)).false;
    });
    it('should return false, as the interval is adjacent from right with a schedule component', () => {
      // 3-10.00-18.00
      const touchingAdjacentFromRight: SameDayInterval = makeSameDayInterval(3, [18, 0], [19, 15]);
      expect(unitUnderTest.isIntervalWithinSchedule(touchingAdjacentFromRight, aSchedule)).false;
      const nonTouchingAdjacentFromRight: SameDayInterval = makeSameDayInterval(
        3,
        [18, 15],
        [19, 30],
      );
      expect(unitUnderTest.isIntervalWithinSchedule(nonTouchingAdjacentFromRight, aSchedule)).false;
    });
    it('should return false, as the interval is overlap from left with a schedule component', () => {
      // 3-10.00-18.00
      const overlappingFromLeft: SameDayInterval = makeSameDayInterval(3, [9, 30], [10, 45]);
      expect(unitUnderTest.isIntervalWithinSchedule(overlappingFromLeft, aSchedule)).false;
    });
    it('should return false, as the interval is overlap from right with a schedule component', () => {
      const overlappingFromRight: SameDayInterval = makeSameDayInterval(3, [17, 30], [18, 45]);
      expect(unitUnderTest.isIntervalWithinSchedule(overlappingFromRight, aSchedule)).false;
    });

    it('should return false, as the interval is placed between schedule components on the same day', () => {
      const placedInBetweenIntervals: SameDayInterval = makeSameDayInterval(2, [14, 0], [15, 15]);
      expect(unitUnderTest.isIntervalWithinSchedule(placedInBetweenIntervals, aSchedule)).false;
    });
  });
});
