import { Injectable } from '@angular/core';
import { Hour, Minute, Time, TimeString } from '../time-manager/Schedule';

const localeOptions = {
  locale: new Intl.Locale('HU'),
  formatOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } satisfies Intl.DateTimeFormatOptions,
} as const;

@Injectable({
  providedIn: 'root',
})
export class DateTimeMapper {
  public timeToDate([hours, minutes]: Time, baseDate: Date): Date {
    const newDate = new Date(baseDate);
    newDate.setHours(hours, minutes);
    return newDate;
  }

  public dateToTimeString(date: Date): TimeString {
    return date.toLocaleTimeString(localeOptions.locale, localeOptions.formatOptions) as TimeString;
  }

  public dateToTime(date: Date): Time {
    const [rawHour, rawMinutes] = this.dateToTimeString(date).split(':');

    return [this.convertStringToHour(rawHour), this.convertStringToMinute(rawMinutes)];
  }

  private convertStringToHour(rawHour: string): Hour {
    const numHour = Number.parseInt(rawHour);
    if (numHour < 0 || numHour > 23) throw new Error(`'${rawHour}' is not valid hour`);
    return numHour as Hour;
  }

  private convertStringToMinute(rawMinute: string): Minute {
    const numMinute = Number.parseInt(rawMinute);
    if (numMinute < 0 || numMinute > 59) throw new Error(`'${rawMinute}' is not valid Minute`);
    return numMinute as Minute;
  }
}
