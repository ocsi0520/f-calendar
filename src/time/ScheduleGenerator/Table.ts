import { Client } from '../../client/Client';
import { TimeInterval } from '../TimeInterval/TimeInterval';
import { DayNumber } from '../TimeInterval/TimeInterval-constants';

// TODO: type ArrayWithindex = { items: Array<number>; currentIndex: number; }

export type ScheduleCell = {
  timeInterval: TimeInterval;
  clientIdsInvolved: Array<Client['id']>;
};

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

export type Table = {
  clientInfos: Array<ClientInfo>;
  currentClientIndex: number;
  scheduleCells: Array<ScheduleCell>;
  currentScheduleCellIndex: number;
};
