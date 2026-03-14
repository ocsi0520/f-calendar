import { DayNumber, Hour, Minute } from '../../definition/time-components';
import { makeSameDayInterval } from '../../definition/TimeInterval';
import { TimeMapper } from '../../mappers/TimeMapper';
import { TableCell } from '../Table';

const timeMapper = new TimeMapper();
export const makeTableCell = (
  dayNumber: DayNumber,
  start: [hour: Hour, minute: Minute],
  end: [hour: Hour, minute: Minute],
  clientIdsInvolved: Array<number> = [],
): TableCell => ({
  clientIdsInvolved,
  timeInterval: makeSameDayInterval(dayNumber, start, end),
  timeStartRepresentation: timeMapper.weekTimeToNumber({
    dayNumber: dayNumber,
    hour: start[0],
    minute: start[1],
  }),
});
