import { describe, it, expect, beforeEach } from 'vitest';
import { TimeMapper } from './TimeMapper';
import { WeekTime } from '../definition/WeekTime';

const ABOVE_MAX = 7 * 24 * 60;

describe(TimeMapper.name, () => {
  let unitUnderTest: TimeMapper;

  beforeEach(() => {
    unitUnderTest = new TimeMapper();
  });

  const cases: Array<{ label: string; weekTime: WeekTime; representation: number }> = [
    {
      label: 'monday 00:00',
      weekTime: { dayNumber: 1, hour: 0, minute: 0 },
      representation: 0,
    },
    {
      label: 'monday 23:59',
      weekTime: { dayNumber: 1, hour: 23, minute: 59 },
      representation: 23 * 60 + 59,
    },
    {
      label: 'tuesday 00:00',
      weekTime: { dayNumber: 2, hour: 0, minute: 0 },
      representation: 24 * 60,
    },
    {
      label: 'wednesday 11:59',
      weekTime: { dayNumber: 3, hour: 11, minute: 59 },
      representation: 2 * 24 * 60 + 11 * 60 + 59,
    },
    {
      label: 'wednesday 12:00',
      weekTime: { dayNumber: 3, hour: 12, minute: 0 },
      representation: 2 * 24 * 60 + 12 * 60,
    },
    {
      label: 'wednesday 12:01',
      weekTime: { dayNumber: 3, hour: 12, minute: 1 },
      representation: 2 * 24 * 60 + 12 * 60 + 1,
    },
    {
      label: 'sunday 00:00',
      weekTime: { dayNumber: 7, hour: 0, minute: 0 },
      representation: 6 * 24 * 60,
    },
    {
      label: 'sunday 17:45',
      weekTime: { dayNumber: 7, hour: 17, minute: 45 },
      representation: 6 * 24 * 60 + 17 * 60 + 45,
    },
    {
      label: 'sunday 23:59',
      weekTime: { dayNumber: 7, hour: 23, minute: 59 },
      representation: 6 * 24 * 60 + 23 * 60 + 59,
    },
  ];

  describe('toNumber', () => {
    it.each(cases)('should convert %s correctly', ({ weekTime, representation }) => {
      const actual = unitUnderTest.toNumber(weekTime);
      expect(actual).toEqual(representation);
    });
  });

  describe('fromNumber', () => {
    it.each(cases)('should convert %s correctly', ({ weekTime, representation }) => {
      const actual = unitUnderTest.fromNumber(representation);
      expect(actual).toEqual(weekTime);
    });

    it('should throw for negative number', () => {
      expect(() => unitUnderTest.fromNumber(-1)).toThrow(RangeError);
    });

    it('should throw for number above MAX_NUM_REPRESENTATION', () => {
      expect(() => unitUnderTest.fromNumber(ABOVE_MAX)).toThrow(RangeError);
    });
  });
});
