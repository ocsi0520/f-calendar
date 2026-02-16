import { Client } from '../../client/Client';
import { TimeInterval } from '../TimeInterval/TimeInterval';

export type SessionCell = {
  timeInterval: TimeInterval;
} & SessionCellStatus;export type SessionCellStatus = { status: 'available'; } |
{ status: 'occupied'; clientIds: Array<Client['id']>; } |
{ status: 'blocked'; relativeToOccupiedIn15Mins: -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4; };

