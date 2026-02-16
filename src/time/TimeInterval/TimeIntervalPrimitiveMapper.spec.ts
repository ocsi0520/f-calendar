import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeInterval } from './TimeInterval';
import { methodName } from '../../utils/test-name';

describe(TimeIntervalPrimitiveMapper.name, () => {
  const unitUnderTest = new TimeIntervalPrimitiveMapper();

  describe(methodName(TimeIntervalPrimitiveMapper, 'mapFromString'), () => {
    it('creates interval from valid formatted string', () => {
      const interval = unitUnderTest.mapFromString('1T08:30_-_10:45');

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 30]);
      expect(interval.end).toEqual([10, 45]);
    });

    it('supports boundary times', () => {
      const interval = unitUnderTest.mapFromString('7T00:00_-_23:59');

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([0, 0]);
      expect(interval.end).toEqual([23, 59]);
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

  describe(methodName(TimeIntervalPrimitiveMapper, 'mapToString'), () => {
    it('produces stable serialized representation', () => {
      const interval = new TimeInterval(3, [9, 15], [10, 45]);

      expect(unitUnderTest.mapToString(interval)).toBe('3T09:15_-_10:45');
    });
  });

  describe('round-trip serialization', () => {
    it('round-trips via string serialization', () => {
      const original = new TimeInterval(5, [12, 0], [13, 30]);
      const reconstructed = unitUnderTest.mapFromString(unitUnderTest.mapToString(original));

      expect(reconstructed.dayNumber).toBe(original.dayNumber);
      expect(reconstructed.start).toEqual(original.start);
      expect(reconstructed.end).toEqual(original.end);
    });
  });
});
