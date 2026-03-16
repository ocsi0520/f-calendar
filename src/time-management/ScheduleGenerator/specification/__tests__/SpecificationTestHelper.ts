import { WeekTime } from '../../../definition/WeekTime';
import { ClientInfo, Table, TableCell } from '../../Table';
import { TableViewGenerator } from '../../table-generator/TableViewGenerator';
import { NextValidStartResult } from '../specification';

export const makeTable = (cells: Array<TableCell>, clientInfos: Array<ClientInfo> = []): Table => ({
  cellPart: {
    views: new TableViewGenerator().generateViewsFrom(cells),
  },
  clientPart: {
    clients: clientInfos,
    currentClientIndex: 0,
  },
});

export const createExpectedResult = (value: true | WeekTime): NextValidStartResult => {
  return value === true ? null : value;
};
