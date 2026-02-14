import { inject, Injectable } from '@angular/core';
import { Client } from './Client';
import { WeekSchedule } from '../time/Schedule';
import { TimeIntervalFactory } from '../time/TimeInterval/TimeInterval';

@Injectable({
  providedIn: 'root',
})
export class MyTimeService {
  // currently working w/ local storage, later on we can move on to a proper BE call
  private static STORAGE_KEY = 'my_time';
  private timeIntervalFactory = inject(TimeIntervalFactory);

  public saveSchedule(newSchedule: WeekSchedule) {
    const stringifiedSchedules = newSchedule.map((timeInterval) => timeInterval.toString());
    stringifiedSchedules.sort();

    localStorage.setItem(MyTimeService.STORAGE_KEY, JSON.stringify(stringifiedSchedules));
  }
  public loadSchedule(): WeekSchedule {
    const timeIntervalStrings = JSON.parse(
      localStorage.getItem(MyTimeService.STORAGE_KEY) || '[]',
    ) as string[];
    timeIntervalStrings.sort(); // might not need, as saveSchedule anyway sort them
    return timeIntervalStrings.map((timeIntervalString) =>
      this.timeIntervalFactory.createOf(timeIntervalString),
    );
  }
}
