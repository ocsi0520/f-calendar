import { TestBed } from '@angular/core/testing';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeIntervalEventMapper } from './TimeIntervalEventMapper';

describe('TimeInterval Factory (Legacy Tests)', () => {
  let primitiveMapper: TimeIntervalPrimitiveMapper;
  let eventMapper: TimeIntervalEventMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeIntervalPrimitiveMapper, TimeIntervalEventMapper],
    });
    primitiveMapper = TestBed.inject(TimeIntervalPrimitiveMapper);
    eventMapper = TestBed.inject(TimeIntervalEventMapper);
  });

  describe('createOf(string) [via TimeIntervalPrimitiveMapper]', () => {
    it('creates interval from valid formatted string', () => {
      const interval = primitiveMapper.mapFromString('1T08:30_-_10:45');

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 30]);
      expect(interval.end).toEqual([10, 45]);
    });

    it('supports boundary times', () => {
      const interval = primitiveMapper.mapFromString('7T00:00_-_23:59');

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([0, 0]);
      expect(interval.end).toEqual([23, 59]);
    });
    it('should throw error for invalid inputs', () => {
      expect(() => primitiveMapper.mapFromString('2T00:00_-_24:00')).toThrow();
      expect(() => primitiveMapper.mapFromString('3T01:65_-_23:00')).toThrow();
      expect(() => primitiveMapper.mapFromString('4T25:11_-_23:00')).toThrow();

      expect(() => primitiveMapper.mapFromString('108:30_-_10:45')).toThrow(
        'Invalid string format for interval',
      );
      expect(() => primitiveMapper.mapFromString('1T08:30-10:45')).toThrow('Invalid string format for interval'); // wrong divider

      expect(() => primitiveMapper.mapFromString('0T08:00_-_09:00')).toThrow('Invalid DayNumber');
      expect(() => primitiveMapper.mapFromString('8T08:00_-_09:00')).toThrow('Invalid DayNumber');

      expect(() => primitiveMapper.mapFromString('xT08:00_-_09:00')).toThrow('Invalid integer');

      expect(() => primitiveMapper.mapFromString('1T8:00_-_09:00')).toThrow('Invalid time string');
      expect(() => primitiveMapper.mapFromString('1T25:00_-_09:00')).toThrow('Invalid time string');
      expect(() => primitiveMapper.mapFromString('1T08:60_-_09:00')).toThrow('Invalid time string');
    });
  });

  describe('createOf(EventDescriptor) [via TimeIntervalEventMapper]', () => {
    it('creates interval from valid descriptor on tuesday', () => {
      const start = new Date('2024-01-09T08:00:00'); // Tuesday
      const end = new Date('2024-01-09T09:30:00');

      const interval = eventMapper.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(2);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on monday', () => {
      const start = new Date('2024-01-08T08:00:00'); // monday
      const end = new Date('2024-01-08T09:30:00');

      const interval = eventMapper.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on sunday', () => {
      const start = new Date('2024-01-07T08:00:00'); // sunday
      const end = new Date('2024-01-07T09:30:00');

      const interval = eventMapper.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('throws if start is null', () => {
      const end = new Date();
      expect(() => eventMapper.mapFromEvent({ start: null, end })).toThrow('invalid eventDescriptor');
    });

    it('throws if end is null', () => {
      const start = new Date();
      expect(() => eventMapper.mapFromEvent({ start, end: null })).toThrow('invalid eventDescriptor');
    });

    it('rejects multi-day intervals', () => {
      const start = new Date('2024-01-08T23:00:00'); // Mon
      const end = new Date('2024-01-09T01:00:00'); // Tues

      expect(() => eventMapper.mapFromEvent({ start, end })).toThrow('does not allow multi-day intervals');
    });
  });
});
