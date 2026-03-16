import { Client } from '../client/Client';
import { DayNumber } from '../definition/time-components';
import { SameDayInterval } from '../definition/TimeInterval';

export type ClientInfo = {
  client: Client;
  joinedAt: Array<number>; // the indexes within ScheduleCells
  possibleCellIndexes: Array<number>; // the indexes within ScheduleCells
  currentIndexOfPossibleCells: number;
  /**
   * The number of days where the client has suitable time with trainer.
   * I.e. 1T7.30_-_10.00, 1T18.30_-_20.00, 3T10.10_-_15.00, 3T19.45_-_21.00, --> 2 (Monday & Wednesday)
   */
  uniqueDays: DayNumber;
};
export type TableClientPart = {
  currentClientIndex: number;
  clients: Array<ClientInfo>;
};

export type TableCell = {
  timeInterval: SameDayInterval;
  clientIdsInvolved: Array<Client['id']>;
  timeStartRepresentation: number;
};

export type ViewByDay = [
  lastCellIndexOfMonday: number,
  lastCellIndexOfTuesday: number,
  lastCellIndexOfWednesday: number,
  lastCellIndexOfThursday: number,
  lastCellIndexOfFriday: number,
  lastCellIndexOfSaturday: number,
];

export type TableCellPart = {
  views: {
    linear: Array<TableCell>;
    byDay: ViewByDay;
  };
};

export type Table = {
  cellPart: TableCellPart;
  clientPart: TableClientPart;
};
