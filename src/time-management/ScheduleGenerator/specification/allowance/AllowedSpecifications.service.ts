import { Injectable } from '@angular/core';
import { AllowedSpecificationsDescriptor } from './AllowedSpecificationsDescriptor';

@Injectable({
  providedIn: 'root',
})
export class AllowedSpecificationsService {
  private static STORAGE_KEY = 'allowed_specs';

  public save(descriptor: AllowedSpecificationsDescriptor): void {
    localStorage.setItem(AllowedSpecificationsService.STORAGE_KEY, JSON.stringify(descriptor));
  }
  public load(): AllowedSpecificationsDescriptor {
    const storedValue = localStorage.getItem(AllowedSpecificationsService.STORAGE_KEY);
    return storedValue === null ? this.getDefault() : JSON.parse(storedValue);
  }

  private getDefault(): AllowedSpecificationsDescriptor {
    return { breakfast: true, lunch: true, noFollowingDayFor2Sessions: false };
  }
}
