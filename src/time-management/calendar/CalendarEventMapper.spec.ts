// https://www.calendar-365.com/calendar/2024/January.html
import { CalendarEventMapper } from './CalendarEventMapper';
import { methodName } from '../../utils/test-name';
import { SameDayIntervalMapper } from '../mappers/SameDayIntervalMapper';
import { TimeMapper } from '../mappers/TimeMapper';
import { makeSameDayInterval } from '../definition/TimeInterval';
import { Session } from '../session';
import { EventInput } from '@fullcalendar/core/index.js';

// TODO: better logs for vitest

describe(CalendarEventMapper.name, () => {
  let unitUnderTest: CalendarEventMapper;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    unitUnderTest = new CalendarEventMapper(new SameDayIntervalMapper(timeMapper), timeMapper);
  });

  describe(methodName(CalendarEventMapper, 'mapFromEvent'), () => {
    type ACase = {
      input: { start: Date | null; end: Date | null; title: string };
      output?: Session;
    };
    const cases: Array<ACase> = [
      {
        input: {
          start: new Date('2024-01-09T08:00:00'), // Tuesday,
          end: new Date('2024-01-09T09:30:00'),
          title: 'meeting',
        },
        output: { interval: makeSameDayInterval(2, [8, 0], [9, 30]), displayName: 'meeting' },
      },
      {
        input: {
          start: new Date('2024-01-08T08:00:00'), // monday
          end: new Date('2024-01-08T09:30:00'),
          title: 'Júlia',
        },
        output: { interval: makeSameDayInterval(1, [8, 0], [9, 30]), displayName: 'Júlia' },
      },
      {
        input: {
          start: new Date('2024-01-07T08:00:00'), // sunday
          end: new Date('2024-01-07T09:30:00'),
          title: '',
        },
        output: { interval: makeSameDayInterval(7, [8, 0], [9, 30]), displayName: 'Meeting' },
      },
      {
        input: {
          start: null,
          end: new Date(),
          title: '',
        },
      },
      {
        input: {
          start: new Date(),
          end: null,
          title: '',
        },
      },
      {
        input: {
          start: null,
          end: null,
          title: '',
        },
      },
      {
        input: {
          start: new Date('2024-01-08T23:00:00'), // Mon
          end: new Date('2024-01-09T01:00:00'), // Tues
          title: '',
        },
      },
    ];
    it.each(cases)('should convert $input correctly', ({ input, output }) => {
      if (output) {
        const actual = unitUnderTest.mapFromEvent(input);
        expect(actual).toEqual(output);
      } else {
        expect(() => unitUnderTest.mapFromEvent(input)).toThrowError();
      }
    });
  });

  describe(methodName(CalendarEventMapper, 'mapToEvent'), () => {
    type ACase = {
      input: { session: Session; baseDate: Date };
      output: EventInput;
    };
    const cases: Array<ACase> = [
      {
        input: {
          session: { displayName: 'Standup', interval: makeSameDayInterval(1, [8, 0], [9, 0]) },
          baseDate: new Date('2024-01-10T12:00:00'), // Wednesday
        },
        output: {
          title: 'Standup',
          color: 'purple',
          start: new Date('2024-01-08T08:00:00'),
          end: new Date('2024-01-08T09:00:00'),
          id: '1T08:00_-_09:00',
        },
      },
      {
        input: {
          session: { displayName: 'Meeting', interval: makeSameDayInterval(2, [10, 0], [11, 0]) },
          baseDate: new Date('2024-01-09T12:00:00'), // Tuesday
        },
        output: {
          title: 'Meeting',
          color: 'purple',
          start: new Date('2024-01-09T10:00:00'),
          end: new Date('2024-01-09T11:00:00'),
          id: '2T10:00_-_11:00',
        },
      },
      {
        input: {
          session: { displayName: 'Meeting', interval: makeSameDayInterval(4, [14, 30], [15, 30]) }, // Thursday
          baseDate: new Date('2024-01-09T00:00:00'), // Tuesday
        },
        output: {
          title: 'Meeting',
          color: 'purple',
          start: new Date('2024-01-11T14:30:00'),
          end: new Date('2024-01-11T15:30:00'),
          id: '4T14:30_-_15:30',
        },
      },
      {
        input: {
          session: { displayName: 'Meeting', interval: makeSameDayInterval(1, [14, 30], [15, 30]) }, // monday
          baseDate: new Date('2024-01-07T00:00:00'), // sunday
        },
        output: {
          title: 'Meeting',
          color: 'purple',
          start: new Date('2024-01-01T14:30:00'),
          end: new Date('2024-01-01T15:30:00'),
          id: '1T14:30_-_15:30',
        },
      },
      {
        input: {
          session: { displayName: 'Meeting', interval: makeSameDayInterval(7, [14, 30], [15, 30]) }, // sunday
          baseDate: new Date('2024-01-08T00:00:00'), // monday
        },
        output: {
          title: 'Meeting',
          color: 'purple',
          start: new Date('2024-01-14T14:30:00'),
          end: new Date('2024-01-14T15:30:00'),
          id: '7T14:30_-_15:30',
        },
      },
    ];

    it.each(cases)('should convert $input correctly', ({ input, output }) => {
      const actual = unitUnderTest.mapToEvent(input.session, input.baseDate);
      expect(actual).toEqual(output);
    });
  });
});
