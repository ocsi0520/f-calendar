// https://www.calendar-365.com/calendar/2024/January.html
import { TimeInterval } from './TimeInterval';
import { TimeIntervalFactory } from './TimeIntervalFactory';

describe('TimeInterval', () => {
  const factory = new TimeIntervalFactory();

  it('toString produces stable serialized representation', () => {
    const interval = new TimeInterval(3, [9, 15], [10, 45]);

    expect(interval.toString()).toBe('3T09:15_-_10:45');
  });

  it('round-trips via string serialization', () => {
    const original = new TimeInterval(5, [12, 0], [13, 30]);
    const reconstructed = factory.createOf(original.toString());

    expect(reconstructed.dayNumber).toBe(original.dayNumber);
    expect(reconstructed.start).toEqual(original.start);
    expect(reconstructed.end).toEqual(original.end);
  });

  describe('toEventWith', () => {
    it('creates event aligned to monday of given week', () => {
      const interval = new TimeInterval(1, [8, 0], [9, 0]);
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
      const interval = new TimeInterval(2, [10, 0], [11, 0]);
      const baseDate = new Date('2024-01-09T12:00:00');

      const event = interval.toEventWith(baseDate);

      expect(event.title).toBe('Meeting');
    });
    it('should handle thursday interval and tuesday base date', () => {
      const interval = new TimeInterval(4, [14, 30], [15, 30]); // Thursday
      const baseDate = new Date('2024-01-09T00:00:00'); // Tuesday

      const event = interval.toEventWith(baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(11); // Jan 11
      expect(start.getDay()).toBe(4); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });

    it('should handle monday interval and sunday base date', () => {
      const interval = new TimeInterval(1, [14, 30], [15, 30]); // monday
      const baseDate = new Date('2024-01-07T00:00:00'); // sunday

      const event = interval.toEventWith(baseDate);

      const start = new Date(event.start as Date);

      expect(start.getDate()).toBe(1); // jan 1
      expect(start.getDay()).toBe(1); // Thursday
      expect(start.getHours()).toBe(14);
      expect(start.getMinutes()).toBe(30);
    });
    it('should handle sunday interval and monday base date', () => {
      const interval = new TimeInterval(7, [14, 30], [15, 30]); // sunday
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
