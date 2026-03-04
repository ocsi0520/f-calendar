import { SameDayInterval } from '../definition/TimeInterval';

export type Client = {
  id: number;
  name: string;
  sessionCountsInWeek: number; // min 1, max 7 I guess
  comment: string;
  schedule: Array<SameDayInterval>;
  disabled: boolean;
};
