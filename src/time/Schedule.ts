import { TimeInterval } from './TimeInterval';

export type WeekSchedule = {
  monday: Array<TimeInterval>;
  tuesday: Array<TimeInterval>;
  wednesday: Array<TimeInterval>;
  thursday: Array<TimeInterval>;
  friday: Array<TimeInterval>;
  saturday: Array<TimeInterval>;
  sunday: Array<TimeInterval>;
};
