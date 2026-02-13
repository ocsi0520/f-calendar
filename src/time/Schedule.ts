import { EventApi } from '@fullcalendar/core/index.js';
import { NumberRange } from '../utils/Range';

export type Hour = NumberRange<23>;
export type Minute = NumberRange<59>;
export type Time = [Hour, Minute];

export const dayByNumber = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
} as const;

export type DayNumber = keyof typeof dayByNumber;

// export type TimeInterval = `${keyof typeof dayByNumber}T${Hour}:${Minute}_-_${Hour}:${Minute}`;

export type WeekSchedule = {
  monday: Array<Time>;
  tuesday: Array<Time>;
  wednesday: Array<Time>;
  thursday: Array<Time>;
  friday: Array<Time>;
  saturday: Array<Time>;
  sunday: Array<Time>;
};

type EventDescriptor = Pick<EventApi, 'start' | 'end'>;

const localeOptions = {
  locale: new Intl.Locale('HU'),
  formatOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } satisfies Intl.DateTimeFormatOptions,
} as const;

// TODO: test
// TODO: separate -> TimeIntervalFactory and TimeInterval
export class TimeInterval {
  private static TIME_REGEX: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  private static TIME_DIVIDER = '_-_';
  public static createOf(wholeIntervalString: string): TimeInterval;
  public static createOf(eventDescriptor: EventDescriptor): TimeInterval;
  public static createOf(input: string | EventDescriptor): TimeInterval {
    return typeof input === 'string'
      ? this.createFromFormattedString(input)
      : this.createFromEventDescriptor(input);
  }

  private static createFromEventDescriptor(eventDescriptor: EventDescriptor): TimeInterval {
    if (!eventDescriptor.start || !eventDescriptor.end)
      throw new Error('invalid eventDescriptor: ' + JSON.stringify(eventDescriptor));
    if (this.getDayNumberFrom(eventDescriptor.start) !== this.getDayNumberFrom(eventDescriptor.end))
      throw new Error('does not allow multi-day intervals');

    const startString = eventDescriptor.start.toLocaleTimeString(
      localeOptions.locale,
      localeOptions.formatOptions,
    );
    const endString = eventDescriptor.end.toLocaleTimeString(
      localeOptions.locale,
      localeOptions.formatOptions,
    );

    return new TimeInterval(
      this.getDayNumberFrom(eventDescriptor.start),
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }
  private static createFromFormattedString(wholeIntervalString: string): TimeInterval {
    const [dayNumberString, timesPart] = this.validateParts(
      wholeIntervalString.split('T'),
      wholeIntervalString,
    );
    const numberOfDay = this.validateNumberOfDay(this.parsePositiveIntStrict(dayNumberString));
    const [startString, endString] = this.validateParts(
      timesPart.split(this.TIME_DIVIDER),
      wholeIntervalString,
    );

    return new TimeInterval(
      numberOfDay,
      this.convertToTime(startString),
      this.convertToTime(endString),
    );
  }
  private static parsePositiveIntStrict(value: string): number {
    if (!/^\d+$/.test(value)) {
      throw new Error(`Invalid integer: "${value}"`);
    }

    return Number(value);
  }

  private static validateParts(parts: string[], wholeIntervalString: string): [string, string] {
    if (parts.length !== 2)
      throw new Error('Invalid string format for interval: ' + wholeIntervalString);
    return parts as [string, string];
  }
  private static validateNumberOfDay(rawDayNumber: number): DayNumber {
    if (rawDayNumber < 1 || rawDayNumber > 7) throw new Error('Invalid DayNumber: ' + rawDayNumber);
    return rawDayNumber as DayNumber;
  }

  private static convertToTime(timeString: string): Time {
    const result = timeString.match(this.TIME_REGEX);
    if (result?.length !== 2) throw new Error('Invalid time string: ' + timeString);

    return [
      this.parsePositiveIntStrict(result[0]) as Hour,
      this.parsePositiveIntStrict(result[1]) as Minute,
    ];
  }

  private static getDayNumberFrom(date: Date): DayNumber {
    return (date.getDay() || 7) as DayNumber;
  }

  private constructor(
    public readonly dayNumber: DayNumber,
    public readonly start: Time,
    public readonly end: Time,
  ) {}
}
