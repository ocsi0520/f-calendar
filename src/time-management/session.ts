import { SameDayInterval } from './definition/TimeInterval';

export const timeGranularityInMins = 15;
export const sessionTime = {
  inSeconds: 75 * 60,
  inMinutes: 75,
  inHours: 75 / 60,
  inGranularity: 75 / timeGranularityInMins,
  inMilliSeconds: 75 * 60 * 1_000,
} as const;

export type Session = { displayName: string; interval: SameDayInterval };
