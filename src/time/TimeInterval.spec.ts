import { TimeInterval, dayByNumber } from './TimeInterval';

// https://www.calendar-365.com/calendar/2024/January.html

describe('TimeInterval.Factory', () => {
  const factory = new TimeInterval.Factory();

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

describe('TimeInterval core behavior', () => {
  const factory = new TimeInterval.Factory();

  it('toString produces stable serialized representation', () => {
    const interval = factory.createOf('3T09:15_-_10:45');

    expect(interval.toString()).toBe('3T09:15_-_10:45');
  });

  it('round-trips via string serialization', () => {
    const original = factory.createOf('5T12:00_-_13:30');
    const reconstructed = factory.createOf(original.toString());

    expect(reconstructed.dayNumber).toBe(original.dayNumber);
    expect(reconstructed.start).toEqual(original.start);
    expect(reconstructed.end).toEqual(original.end);
  });

  describe('toEventWith', () => {
    it('creates event aligned to monday of given week', () => {
      const interval = factory.createOf('1T08:00_-_09:00'); // Monday
      const baseDate = new Date('2024-01-10T12:00:00'); // Wednesday

      const event = interval.toEventWith(baseDate, 'Standup');

      expect(event.title).toBe('Standup');
      expect(event.color).toBe('lightblue');
      expect(event.id).toBe(interval.toString());

      const start = new Date(event.start as Date);
      const end = new Date(event.end as Date);

      expect(start.getDay()).toBe(1); // Monday
      expect(start.getHours()).toBe(8);
      expect(start.getMinutes()).toBe(0);

      expect(end.getDay()).toBe(1);
      expect(end.getHours()).toBe(9);
      expect(end.getMinutes()).toBe(0);
    });

    it('defaults title when omitted', () => {
      const interval = factory.createOf('2T10:00_-_11:00');
      const baseDate = new Date('2024-01-09T12:00:00');

      const event = interval.toEventWith(baseDate);

      expect(event.title).toBe('Meeting');
    });
    it('should handle thursday interval and tuesday base date', () => {
      const interval = factory.createOf('4T14:30_-_15:30'); // Thursday
      const baseDate = new Date('2024-01-09T00:00:00'); // Tuesday

      const event = interval.toEventWith(baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(11); // Jan 11
      expect(start.getDay()).toBe(4); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });

    it('should handle monday interval and sunday base date', () => {
      const interval = factory.createOf('1T14:30_-_15:30'); // monday
      const baseDate = new Date('2024-01-07T00:00:00'); // sunday

      const event = interval.toEventWith(baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(1); // jan 1
      expect(start.getDay()).toBe(1); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });
    it('should handle sunday interval and monday base date', () => {
      const interval = factory.createOf('7T14:30_-_15:30'); // sunday
      const baseDate = new Date('2024-01-08T00:00:00'); // monday

      const event = interval.toEventWith(baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(14); // jan 14
      expect(start.getDay()).toBe(0); // sunday - 0 for raw dates
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });
  });
});

describe('dayByNumber', () => {
  it('contains all seven days', () => {
    const keys = Object.keys(dayByNumber).map(Number);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('maps correctly', () => {
    expect(dayByNumber[1]).toBe('Monday');
    expect(dayByNumber[7]).toBe('Sunday');
  });
});
