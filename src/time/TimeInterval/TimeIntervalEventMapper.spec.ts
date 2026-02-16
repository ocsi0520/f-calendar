// https://www.calendar-365.com/calendar/2024/January.html
import { TestBed } from '@angular/core/testing';
import { TimeIntervalEventMapper } from './TimeIntervalEventMapper';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeInterval } from './TimeInterval';
import { methodName } from '../../utils/test-name';

describe(TimeIntervalEventMapper.name, () => {
  let unitUnderTest: TimeIntervalEventMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeIntervalEventMapper, TimeIntervalPrimitiveMapper],
    });
    unitUnderTest = TestBed.inject(TimeIntervalEventMapper);
  });

  describe(methodName(TimeIntervalEventMapper, 'mapFromEvent'), () => {
    it('creates interval from valid descriptor on tuesday', () => {
      const start = new Date('2024-01-09T08:00:00'); // Tuesday
      const end = new Date('2024-01-09T09:30:00');

      const interval = unitUnderTest.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(2);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on monday', () => {
      const start = new Date('2024-01-08T08:00:00'); // monday
      const end = new Date('2024-01-08T09:30:00');

      const interval = unitUnderTest.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(1);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('creates interval from valid descriptor on sunday', () => {
      const start = new Date('2024-01-07T08:00:00'); // sunday
      const end = new Date('2024-01-07T09:30:00');

      const interval = unitUnderTest.mapFromEvent({ start, end });

      expect(interval.dayNumber).toBe(7);
      expect(interval.start).toEqual([8, 0]);
      expect(interval.end).toEqual([9, 30]);
    });

    it('throws if start is null', () => {
      const end = new Date();
      expect(() => unitUnderTest.mapFromEvent({ start: null, end })).toThrow(
        'invalid eventDescriptor',
      );
    });

    it('throws if end is null', () => {
      const start = new Date();
      expect(() => unitUnderTest.mapFromEvent({ start, end: null })).toThrow(
        'invalid eventDescriptor',
      );
    });

    it('rejects multi-day intervals', () => {
      const start = new Date('2024-01-08T23:00:00'); // Mon
      const end = new Date('2024-01-09T01:00:00'); // Tues

      expect(() => unitUnderTest.mapFromEvent({ start, end })).toThrow(
        'does not allow multi-day intervals',
      );
    });
  });

  describe(methodName(TimeIntervalEventMapper, 'mapToEvent'), () => {
    it('creates event aligned to monday of given week', () => {
      const interval: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 0] };
      const baseDate = new Date('2024-01-10T12:00:00'); // Wednesday

      const event = unitUnderTest.mapToEvent(interval, baseDate, 'Standup');

      expect(event.title).toBe('Standup');
      expect(event.color).toBe('lightblue');

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
      const interval: TimeInterval = { dayNumber: 2, start: [10, 0], end: [11, 0] };
      const baseDate = new Date('2024-01-09T12:00:00');

      const event = unitUnderTest.mapToEvent(interval, baseDate);

      expect(event.title).toBe('Meeting');
    });

    it('should handle thursday interval and tuesday base date', () => {
      const interval: TimeInterval = { dayNumber: 4, start: [14, 30], end: [15, 30] }; // Thursday
      const baseDate = new Date('2024-01-09T00:00:00'); // Tuesday

      const event = unitUnderTest.mapToEvent(interval, baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(11); // Jan 11
      expect(start.getDay()).toBe(4); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });

    it('should handle monday interval and sunday base date', () => {
      const interval: TimeInterval = { dayNumber: 1, start: [14, 30], end: [15, 30] }; // monday
      const baseDate = new Date('2024-01-07T00:00:00'); // sunday

      const event = unitUnderTest.mapToEvent(interval, baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(1); // jan 1
      expect(start.getDay()).toBe(1); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });

    it('should handle sunday interval and monday base date', () => {
      const interval: TimeInterval = { dayNumber: 7, start: [14, 30], end: [15, 30] }; // sunday
      const baseDate = new Date('2024-01-08T00:00:00'); // monday

      const event = unitUnderTest.mapToEvent(interval, baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(14); // jan 14
      expect(start.getDay()).toBe(0); // sunday - 0 for raw dates
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });
  });
});
