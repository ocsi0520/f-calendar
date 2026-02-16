import { Client } from '../../../client/Client';
import { SessionCell } from '../SessionCell';

export type ScheduleTableInfo = {
  myCells: Array<SessionCell>;
  currentIndexOfCell: number;
  clientInfo: {
    clientsInvolved: Array<{ client: Client, cells: SessionCell }>;
    currentlyManagedClientId: Client['id'];
    sessionsPlacedForClientSoFar: number;
  };
};
