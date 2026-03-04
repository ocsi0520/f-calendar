import { SameDayIntervalMapper } from './SameDayIntervalMapper';
import { methodName } from '../../utils/test-name';
import { TimeMapper } from './TimeMapper';
import { DayTime, makeSameDayInterval, SameDayInterval } from '../definition/TimeInterval';
import { Hour, Minute } from '../definition/time-components';

describe(SameDayIntervalMapper.name, () => {
  let unitUnderTest: SameDayIntervalMapper;

  beforeEach(() => {
    unitUnderTest = new SameDayIntervalMapper(new TimeMapper());
  });

  const testDayTime = ({ hour, minute }: DayTime, expectedPair: [Hour, Minute]) => {
    expect([hour, minute]).toEqual(expectedPair);
  };

  describe(methodName(SameDayIntervalMapper, 'mapFromString'), () => {
    it('creates interval from valid formatted string', () => {
      const interval = unitUnderTest.mapFromString('1T08:30_-_10:45');

      expect(interval.dayNumber).toBe(1);
      testDayTime(interval.start, [8, 30]);
      testDayTime(interval.end, [10, 45]);
    });

    it('supports boundary times', () => {
      const interval = unitUnderTest.mapFromString('7T00:00_-_23:59');

      expect(interval.dayNumber).toBe(7);
      testDayTime(interval.start, [0, 0]);
      testDayTime(interval.end, [23, 59]);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => unitUnderTest.mapFromString('2T00:00_-_24:00')).toThrow();
      expect(() => unitUnderTest.mapFromString('3T01:65_-_23:00')).toThrow();
      expect(() => unitUnderTest.mapFromString('4T25:11_-_23:00')).toThrow();

      expect(() => unitUnderTest.mapFromString('108:30_-_10:45')).toThrow(
        'Invalid string format for interval',
      );
      expect(() => unitUnderTest.mapFromString('1T08:30-10:45')).toThrow(
        'Invalid string format for interval',
      ); // wrong divider

      expect(() => unitUnderTest.mapFromString('0T08:00_-_09:00')).toThrow('Invalid DayNumber');
      expect(() => unitUnderTest.mapFromString('8T08:00_-_09:00')).toThrow('Invalid DayNumber');

      expect(() => unitUnderTest.mapFromString('xT08:00_-_09:00')).toThrow('Invalid integer');

      expect(() => unitUnderTest.mapFromString('1T8:00_-_09:00')).toThrow('Invalid time string');
      expect(() => unitUnderTest.mapFromString('1T25:00_-_09:00')).toThrow('Invalid time string');
      expect(() => unitUnderTest.mapFromString('1T08:60_-_09:00')).toThrow('Invalid time string');
    });
  });

  describe(methodName(SameDayIntervalMapper, 'mapToString'), () => {
    it('produces stable serialized representation', () => {
      const interval: SameDayInterval = makeSameDayInterval(3, [9, 15], [10, 45]);

      expect(unitUnderTest.mapToString(interval)).toBe('3T09:15_-_10:45');
    });
  });

  describe('round-trip serialization', () => {
    it('round-trips via string serialization', () => {
      const original: SameDayInterval = makeSameDayInterval(5, [12, 0], [13, 30]);
      const reconstructed = unitUnderTest.mapFromString(unitUnderTest.mapToString(original));

      expect(reconstructed.dayNumber).toBe(original.dayNumber);
      expect(reconstructed.start).toEqual(original.start);
      expect(reconstructed.end).toEqual(original.end);
    });
  });

  describe(methodName(SameDayIntervalMapper, 'mapFromNumber'), () => {
    it('should throw in case of invalid numbers', () => {
      expect(() => unitUnderTest.mapFromNumber(101606400)).toThrow('Invalid encoded number');
      expect(() => unitUnderTest.mapFromNumber(-1)).toThrow('Invalid encoded number');
      expect(() => unitUnderTest.mapFromNumber(10079)).toThrow(
        'SameDayInterval: not the same day 1 & 7',
      );
    });
    describe('edge cases', () => {
      it('should handle monday midnight from-to', () => {
        const actual = unitUnderTest.mapFromNumber(0);
        expect(actual.dayNumber).toBe(1);
        testDayTime(actual.start, [0, 0]);
        testDayTime(actual.end, [0, 0]);
      });
      it('should handle sunday 23.59 from-to', () => {
        const actual = unitUnderTest.mapFromNumber(101606399);
        expect(actual.dayNumber).toBe(7);
        testDayTime(actual.start, [23, 59]);
        testDayTime(actual.end, [23, 59]);
      });
      it('should handle from monday 00.00 to monday 23.59', () => {
        const actual = unitUnderTest.mapFromNumber(1439);
        expect(actual.dayNumber).toBe(1);
        testDayTime(actual.start, [0, 0]);
        testDayTime(actual.end, [23, 59]);
      });
      it('should handle from sunday 00.00 to sunday 23.59', () => {
        const actual = unitUnderTest.mapFromNumber(87101279);
        expect(actual.dayNumber).toBe(7);
        testDayTime(actual.start, [0, 0]);
        testDayTime(actual.end, [23, 59]);
      });
    });
    describe('normal cases', () => {
      it('should handle tuesday 10.00 - 14.15', () => {
        const actual = unitUnderTest.mapFromNumber(20565495);
        expect(actual.dayNumber).toBe(2);
        testDayTime(actual.start, [10, 0]);
        testDayTime(actual.end, [14, 15]);
      });
      it('should handle thursday 18.30 - 21.00', () => {
        const actual = unitUnderTest.mapFromNumber(54739980);
        expect(actual.dayNumber).toBe(4);
        testDayTime(actual.start, [18, 30]);
        testDayTime(actual.end, [21, 0]);
      });
      it('should handle saturday 11.00 - 19.00', () => {
        const actual = unitUnderTest.mapFromNumber(79237140);
        expect(actual.dayNumber).toBe(6);
        testDayTime(actual.start, [11, 0]);
        testDayTime(actual.end, [19, 0]);
      });
    });
  });
  describe(methodName(SameDayIntervalMapper, 'mapToNumber'), () => {
    describe('edge cases', () => {
      it('should handle monday midnight from-to', () => {
        const input: SameDayInterval = makeSameDayInterval(1, [0, 0], [0, 0]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(0);
      });
      it('should handle sunday 23.59 from-to', () => {
        const input: SameDayInterval = makeSameDayInterval(7, [23, 59], [23, 59]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(101606399);
      });
      it('should handle from monday 00.00 to monday 23.59', () => {
        const input: SameDayInterval = makeSameDayInterval(1, [0, 0], [23, 59]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(1439);
      });
      it('should handle from sunday 00.00 to sunday 23.59', () => {
        const input: SameDayInterval = makeSameDayInterval(7, [0, 0], [23, 59]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(87101279);
      });
    });
    describe('normal cases', () => {
      it('should handle tuesday 10.00 - 14.15', () => {
        const input: SameDayInterval = makeSameDayInterval(2, [10, 0], [14, 15]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(20565495);
      });
      it('should handle thursday 18.30 - 21.00', () => {
        const input: SameDayInterval = makeSameDayInterval(4, [18, 30], [21, 0]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(54739980);
      });
      it('should handle saturday 11.00 - 19.00', () => {
        const input: SameDayInterval = makeSameDayInterval(6, [11, 0], [19, 0]);
        const actual = unitUnderTest.mapToNumber(input);
        expect(actual).toBe(79237140);
      });
    });
  });
});
