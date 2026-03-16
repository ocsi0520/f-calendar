import { Injectable } from '@angular/core';
import {
  testClients,
  testMyTime,
  testNextId,
  testPairs,
} from '../time-management/ScheduleGenerator/__tests__/test-input';
import { AllowedSpecificationsDescriptor } from '../time-management/ScheduleGenerator/specification/allowance/AllowedSpecificationsDescriptor';

@Injectable({ providedIn: 'root' })
export class DemoService {
  public injectData(): void {
    const allowedSpecs: AllowedSpecificationsDescriptor = {
      breakfast: true,
      lunch: true,
      noFollowingDayFor2Sessions: false,
    };
    localStorage.setItem('calendar_clients', JSON.stringify(testClients));
    localStorage.setItem('calendar_clients_id', JSON.stringify(testNextId));
    localStorage.setItem('client_pairs', JSON.stringify(testPairs));
    localStorage.setItem('my_time', JSON.stringify(testMyTime));
    localStorage.setItem('allowed_specs', JSON.stringify(allowedSpecs));
  }
}
