import { Injectable } from '@angular/core';
import { SameDayInterval } from '../definition/TimeInterval';
import { TimeMapper } from './TimeMapper';

const TIME_DIVIDER = '_-_';

const NUMBER_BASE = 7 * 24 * 60;
const MAXIMUM_VALID_ENCODED_NUMBER = NUMBER_BASE ** 2 - 1;

@Injectable({
  providedIn: 'root',
})
export class SameDayIntervalMapper {
  constructor(private timeMapper: TimeMapper) {}

  public mapToNumber({ start, end, dayNumber }: SameDayInterval): number {
    const startFromMondayMidnight = this.timeMapper.weekTimeToNumber({
      dayNumber,
      hour: start.hour,
      minute: start.minute,
    });
    const endFromMondayMidnight = this.timeMapper.weekTimeToNumber({
      dayNumber,
      hour: end.hour,
      minute: end.minute,
    });
    return startFromMondayMidnight * NUMBER_BASE + endFromMondayMidnight;
  }

  public mapFromNumber(encodedNumber: number): SameDayInterval {
    if (encodedNumber > MAXIMUM_VALID_ENCODED_NUMBER || encodedNumber < 0)
      throw new Error('Invalid encoded number');
    const encodedStart = Math.floor(encodedNumber / NUMBER_BASE);
    const encodedEnd = encodedNumber % NUMBER_BASE;

    const startTime = this.timeMapper.weekTimeFromNumber(encodedStart);
    const endTime = this.timeMapper.weekTimeFromNumber(encodedEnd);

    if (startTime.dayNumber !== endTime.dayNumber)
      throw new Error(
        `SameDayInterval: not the same day ${startTime.dayNumber} & ${endTime.dayNumber}`,
      );

    return {
      dayNumber: startTime.dayNumber,
      start: { hour: startTime.hour, minute: startTime.minute },
      end: { hour: endTime.hour, minute: endTime.minute },
    };
  }

  public mapToString(SameDayInterval: SameDayInterval): string {
    const timePart = [SameDayInterval.start, SameDayInterval.end]
      .map(this.timeMapper.dayTimeToString.bind(this.timeMapper))
      .join(TIME_DIVIDER);

    return `${SameDayInterval.dayNumber}T${timePart}`;
  }

  public mapFromString(wholeIntervalString: string): SameDayInterval {
    const [dayNumberString, timesPart] = this.validateParts(
      wholeIntervalString.split('T'),
      wholeIntervalString,
    );

    const numberOfDay = this.timeMapper.dayNumberFromString(dayNumberString);

    const [startString, endString] = this.validateParts(
      timesPart.split(TIME_DIVIDER),
      wholeIntervalString,
    );

    return {
      dayNumber: numberOfDay,
      start: this.timeMapper.dayTimeFromString(startString),
      end: this.timeMapper.dayTimeFromString(endString),
    };
  }

  private validateParts(parts: string[], wholeIntervalString: string): [string, string] {
    if (parts.length !== 2)
      throw new Error('Invalid string format for interval: ' + wholeIntervalString);
    return parts as [string, string];
  }
}
