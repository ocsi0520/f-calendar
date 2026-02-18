import { Client } from '../../client/Client';
import { TimeInterval } from '../TimeInterval/TimeInterval';

export type ScheduleItem = {
  timeInterval: TimeInterval;
  clientIdsInvolved: Array<Client['id']>;
};

export type ClientInfo = {
  client: Client;
  joinedAt: number[]; // the indexes within ScheduleItems
};

export type Table = {
  clientInfos: Array<ClientInfo>;
  currentClientIndex: number;
  scheduleItems: Array<ScheduleItem>;
};
