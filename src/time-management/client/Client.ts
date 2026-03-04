import { WeekSchedule } from '../time/Schedule';

export type Client = {
  id: number;
  name: string;
  sessionCountsInWeek: number; // min 1, max 7 I guess
  comment: string;
  schedule: WeekSchedule;
  disabled: boolean;
};
