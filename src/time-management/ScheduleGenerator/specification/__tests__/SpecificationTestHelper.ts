import { groupBy } from '../../../../utils/groupby';
import { WeekTime } from '../../../definition/WeekTime';
import { ClientInfo, Table, TableCell } from '../../Table';
import { NextValidStartResult } from '../specification';

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

export const createExpectedResult = (value: true | WeekTime): NextValidStartResult => {
  return value === true ? null : value;
};
