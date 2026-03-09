import { groupBy } from '../../../../utils/groupby';
import { WeekTime } from '../../../definition/WeekTime';
import { ClientInfo, Table, TableCell } from '../../Table';
import { Result } from '../specification';
import { expect } from 'vitest';

export const makeTable = (cells: Array<TableCell>, clientInfos: Array<ClientInfo> = []): Table => ({
  cellPart: {
    views: {
      linear: cells,
      byDay: groupBy(cells, (cell) => cell.timeInterval.dayNumber),
    },
  },
  clientPart: {
    clients: clientInfos,
    currentClientIndex: 0,
  },
});

export const createExpectedResult = (value: true | WeekTime): Result => {
  return value === true
    ? { passed: true }
    : { passed: false, nextTryHint: { firstValidStart: value }, name: expect.any(String) };
};
