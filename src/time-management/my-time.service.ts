import { Injectable } from '@angular/core';
import { SameDayInterval } from './definition/TimeInterval';
import { SameDayIntervalMapper } from './mappers/SameDayIntervalMapper';

@Injectable({
  providedIn: 'root',
})
export class MyTimeService {
  // currently working w/ local storage, later on we can move on to a proper BE call
  private static STORAGE_KEY = 'my_time';

  constructor(private readonly mapper: SameDayIntervalMapper) {}

  public saveSchedule(newSchedule: Array<SameDayInterval>): void {
    const stringifiedSchedules = newSchedule.map((timeInterval) =>
      this.mapper.mapToString(timeInterval),
    );
    stringifiedSchedules.sort();

    localStorage.setItem(MyTimeService.STORAGE_KEY, JSON.stringify(stringifiedSchedules));
  }
  public loadSchedule(): Array<SameDayInterval> {
    const timeIntervalStrings = JSON.parse(
      localStorage.getItem(MyTimeService.STORAGE_KEY) || '[]',
    ) as string[];
    timeIntervalStrings.sort(); // might not need, as saveSchedule anyway sort them
    return timeIntervalStrings.map((timeIntervalString) =>
      this.mapper.mapFromString(timeIntervalString),
    );
  }
}
