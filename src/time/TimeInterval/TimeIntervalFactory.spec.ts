import { TimeIntervalFactory } from "./TimeIntervalFactory";

describe('TimeInterval.Factory', () => {
  const factory = new TimeIntervalFactory();

  describe('createOf(string)', () => {
    it('creates interval from valid formatted string', () => {
      const interval = factory.createOf('1T08:30_-_10:45');

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 30]);
      expect(interval.end).toEqual([10, 45]);
    });

    it('supports boundary times', () => {
      const interval = factory.createOf('7T00:00_-_23:59');

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([0, 0]);
      expect(interval.end).toEqual([23, 59]);
    });
    it('should throw error for invalid inputs', () => {
      expect(() => factory.createOf('2T00:00_-_24:00')).toThrow();
      expect(() => factory.createOf('3T01:65_-_23:00')).toThrow();
      expect(() => factory.createOf('4T25:11_-_23:00')).toThrow();

      expect(() => factory.createOf('108:30_-_10:45')).toThrow(
        'Invalid string format for interval',
      );
      expect(() => factory.createOf('1T08:30-10:45')).toThrow('Invalid string format for interval'); // wrong divider

      expect(() => factory.createOf('0T08:00_-_09:00')).toThrow('Invalid DayNumber');
      expect(() => factory.createOf('8T08:00_-_09:00')).toThrow('Invalid DayNumber');

      expect(() => factory.createOf('xT08:00_-_09:00')).toThrow('Invalid integer');

      expect(() => factory.createOf('1T8:00_-_09:00')).toThrow('Invalid time string');
      expect(() => factory.createOf('1T25:00_-_09:00')).toThrow('Invalid time string');
      expect(() => factory.createOf('1T08:60_-_09:00')).toThrow('Invalid time string');
    });
  });

  describe('createOf(EventDescriptor)', () => {
    it('creates interval from valid descriptor on tuesday', () => {
      const start = new Date('2024-01-09T08:00:00'); // Tuesday
      const end = new Date('2024-01-09T09:30:00');

      const interval = factory.createOf({ start, end });

      expect(interval.dayNumber).toBe(2);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on monday', () => {
      const start = new Date('2024-01-08T08:00:00'); // monday
      const end = new Date('2024-01-08T09:30:00');

      const interval = factory.createOf({ start, end });

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on sunday', () => {
      const start = new Date('2024-01-07T08:00:00'); // sunday
      const end = new Date('2024-01-07T09:30:00');

      const interval = factory.createOf({ start, end });

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('throws if start is null', () => {
      const end = new Date();
      expect(() => factory.createOf({ start: null, end })).toThrow('invalid eventDescriptor');
    });

    it('throws if end is null', () => {
      const start = new Date();
      expect(() => factory.createOf({ start, end: null })).toThrow('invalid eventDescriptor');
    });

    it('rejects multi-day intervals', () => {
      const start = new Date('2024-01-08T23:00:00'); // Mon
      const end = new Date('2024-01-09T01:00:00'); // Tues

      expect(() => factory.createOf({ start, end })).toThrow('does not allow multi-day intervals');
    });
  });
});
