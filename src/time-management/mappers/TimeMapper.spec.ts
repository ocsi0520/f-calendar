import { describe, it, expect, beforeEach } from 'vitest';
import { TimeMapper } from './TimeMapper';
import { WeekTime } from '../definition/WeekTime';
import { methodName } from '../../utils/test-name';
import { DayTime } from '../definition/TimeInterval';

const ABOVE_MAX = 7 * 24 * 60;

describe(TimeMapper.name, () => {
  let unitUnderTest: TimeMapper;

  beforeEach(() => {
    unitUnderTest = new TimeMapper();
  });

  describe('week time', () => {
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
    describe(methodName(TimeMapper, 'weekTimeToNumber'), () => {
      it.each(cases)('should convert %s correctly', ({ weekTime, representation }) => {
        const actual = unitUnderTest.weekTimeToNumber(weekTime);
        expect(actual).toEqual(representation);
      });
    });

    describe(methodName(TimeMapper, 'weekTimeFromNumber'), () => {
      it.each(cases)('should convert %s correctly', ({ weekTime, representation }) => {
        const actual = unitUnderTest.weekTimeFromNumber(representation);
        expect(actual).toEqual(weekTime);
      });

      it('should throw for negative number', () => {
        expect(() => unitUnderTest.weekTimeFromNumber(-1)).toThrow(RangeError);
      });

      it('should throw for number above MAX_NUM_REPRESENTATION', () => {
        expect(() => unitUnderTest.weekTimeFromNumber(ABOVE_MAX)).toThrow(RangeError);
      });
    });
  });
  describe('day time', () => {
    type DayTimeCase = {
      stringRepresentation: string;
      dayTime?: DayTime;
      numRepresentation: number;
    };
    type ValidDayTimeCase = Required<DayTimeCase>;
    const cases: Array<DayTimeCase> = [
      { stringRepresentation: '23:59', dayTime: { hour: 23, minute: 59 }, numRepresentation: 1439 },
      { stringRepresentation: '23:30', dayTime: { hour: 23, minute: 30 }, numRepresentation: 1410 },
      { stringRepresentation: '00:00', dayTime: { hour: 0, minute: 0 }, numRepresentation: 0 },
      { stringRepresentation: 'too high', numRepresentation: 1441 },
      { stringRepresentation: 'too low', numRepresentation: -1 },
      { stringRepresentation: '24:00', numRepresentation: NaN },
      { stringRepresentation: '24:01', numRepresentation: NaN },
      { stringRepresentation: '30:00', numRepresentation: NaN },
      { stringRepresentation: '99:99', numRepresentation: NaN },
      { stringRepresentation: '76:02', numRepresentation: NaN },
      { stringRepresentation: '-6:02', numRepresentation: NaN },
      { stringRepresentation: '00:60', numRepresentation: NaN },
    ];
    const validCases: Array<ValidDayTimeCase> = cases.filter(
      (aCase) => aCase.dayTime,
    ) as Array<ValidDayTimeCase>;
    describe(methodName(TimeMapper, 'dayTimeToNumber'), () => {
      it.each(validCases)('should convert %s correctly', ({ dayTime, numRepresentation }) => {
        const actual = unitUnderTest.dayTimeToNumber(dayTime!);
        expect(actual).toEqual(numRepresentation);
      });
    });
    describe(methodName(TimeMapper, 'dayTimeFromNumber'), () => {
      it.each(cases)('should convert %s correctly', ({ dayTime, numRepresentation }) => {
        if (dayTime) {
          const actual = unitUnderTest.dayTimeFromNumber(numRepresentation);
          expect(actual).toEqual(dayTime);
        } else {
          expect(() => unitUnderTest.dayTimeFromNumber(numRepresentation)).toThrowError(RangeError);
        }
      });
    });
    describe(methodName(TimeMapper, 'dayNumberFromString'), () => {
      it('should read dayNumber from string', () => {
        const actual = ['1', '2', '3', '4', '5', '6', '7'].map(
          unitUnderTest.dayNumberFromString.bind(unitUnderTest),
        );
        expect(actual).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });
      it('should throw error in case of invalid dayNumber-string-representation', () => {
        expect(() => unitUnderTest.dayNumberFromString('0')).toThrowError();
        expect(() => unitUnderTest.dayNumberFromString('-1')).toThrowError();
        expect(() => unitUnderTest.dayNumberFromString('')).toThrowError();
        expect(() => unitUnderTest.dayNumberFromString(' ')).toThrowError();
        expect(() => unitUnderTest.dayNumberFromString('monday')).toThrowError();
        expect(() => unitUnderTest.dayNumberFromString('8')).toThrowError();
      });
    });
    describe(methodName(TimeMapper, 'dayTimeToString'), () => {
      it.each(validCases)('should convert %s correctly', ({ dayTime, stringRepresentation }) => {
        const actual = unitUnderTest.dayTimeToString(dayTime!);
        expect(actual).toEqual(stringRepresentation);
      });
    });
    describe(methodName(TimeMapper, 'dayTimeFromString'), () => {
      it.each(cases)('should convert %s correctly', ({ dayTime, stringRepresentation }) => {
        if (dayTime) {
          const actual = unitUnderTest.dayTimeFromString(stringRepresentation);
          expect(actual).toEqual(dayTime);
        } else {
          expect(() => unitUnderTest.dayTimeFromString(stringRepresentation)).toThrowError();
        }
      });
    });
  });
});
