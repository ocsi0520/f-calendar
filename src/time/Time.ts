import { NumberRange } from '../utils/Range';

export type Hour = NumberRange<23>;
export type Minute = NumberRange<59>;
export type Time = [Hour, Minute];
