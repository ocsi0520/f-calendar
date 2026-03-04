import { NumberRange } from '../../utils/Range'
export type DayNumber = Exclude<NumberRange<7>, 0>
export type Hour = NumberRange<23>
export type Minute = NumberRange<59>