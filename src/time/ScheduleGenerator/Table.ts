import { Client } from '../../client/Client';
import { TimeInterval } from '../TimeInterval/TimeInterval';

export type ScheduleCell = {
  timeInterval: TimeInterval;
  clientIdsInvolved: Array<Client['id']>;
};

export type ClientInfo = {
  client: Client;
  joinedAt: number[]; // the indexes within ScheduleCells
};

export type Table = {
  clientInfos: Array<ClientInfo>;
  currentClientIndex: number;
  scheduleCells: Array<ScheduleCell>;
  currentScheduleCellIndex: number;
};
