import { TimeInterval } from '../../../TimeInterval/TimeInterval';
import { ClientInfo, ScheduleCell, Table } from '../../Table';
import { Result, ScheduleSpecification } from '../specification';

export const makeTable = (
  scheduleCells: Array<ScheduleCell>,
  clientInfos: Array<ClientInfo> = [],
): Table => ({
  clientInfos,
  currentClientIndex: 0,
  scheduleCells,
  currentScheduleCellIndex: 0,
});
export const selectForSpec = (table: Table): Parameters<ScheduleSpecification['check']> => {
  const currentCell = table.scheduleCells[table.currentScheduleCellIndex];
  const sameDayCells = table.scheduleCells.filter(
    (cell) => cell.timeInterval.dayNumber === currentCell.timeInterval.dayNumber,
  );
  return [table, sameDayCells, currentCell];
};

export const createExpectedResult = (value: true | TimeInterval): Result => {
  return value === true
    ? { passed: true }
    : { passed: false, nextTryHint: { firstValidInterval: value } };
};
