import { TimeInterval } from '../../../TimeInterval/TimeInterval';
import { ClientInfo, ScheduleItem, Table } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export const makeTable = (
  scheduleItems: Array<ScheduleItem>,
  clientInfos: Array<ClientInfo> = [],
): Table => ({
  clientInfos,
  currentClientIndex: 0,
  scheduleItems,
  currentScheduleItemIndex: 0,
});
export const selectForSpec = (table: Table): Parameters<ScheduleSpecification['check']> => {
  const currentCell = table.scheduleItems[table.currentScheduleItemIndex];
  const sameDayCells = table.scheduleItems.filter(
    (cell) => cell.timeInterval.dayNumber === currentCell.timeInterval.dayNumber,
  );
  return [table, sameDayCells, currentCell];
};

export const createExpectedResult = (value: true | TimeInterval): Result => {
  return value === true
    ? { passed: true }
    : { passed: false, nextTryHint: { firstValidInterval: value } };
};
