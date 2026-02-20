import { TimeInterval } from './TimeInterval/TimeInterval';

export type WeekSchedule = Array<TimeInterval>;

export type DisplayableSchedule = Array<TimeInterval & { readonly displayName?: string }>;
