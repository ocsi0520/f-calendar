import { NumberRange } from '../utils/Range';

export type Hour = NumberRange<23>;
export type Minute = NumberRange<59>;

export type Time = [hour: Hour, minute: Minute];
export type TimeInterval = [from: Time, to: Time];
export type WeekSchedule = {
  monday: Array<Time>;
  tuesday: Array<Time>;
  wednesday: Array<Time>;
  thursday: Array<Time>;
  friday: Array<Time>;
  saturday: Array<Time>;
  sunday: Array<Time>;
};

// 17:41:07
export type TimeString = `${number}:${number}`;
export const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
