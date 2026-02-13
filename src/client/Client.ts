import { WeekSchedule } from '../time/Schedule';

export type Client = {
  id: number;
  name: string;
  sessionCountsInWeek: number;
  comment: string;
  schedule: WeekSchedule;
};
