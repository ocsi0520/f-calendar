import { methodName } from '../../../utils/test-name';
import { makeSameDayInterval, SameDayInterval } from '../../definition/TimeInterval';
import { SameDayIntervalMapper } from '../../mappers/SameDayIntervalMapper';
import { TimeMapper } from '../../mappers/TimeMapper';
import { Client } from '../Client';
import { ClientService } from '../client.service';

describe(ClientService.name, () => {
  let unitUnderTest: ClientService;

  const newTestClient1: Omit<Client, 'id'> = {
    comment: 'comment',
    name: 'Kis Gizella',
    schedule: [],
    sessionCountsInWeek: 2,
    disabled: false,
  };
  const newTestClient2: Omit<Client, 'id'> = {
    comment: 'comment',
    name: 'Kis Amanda',
    schedule: [],
    sessionCountsInWeek: 3,
    disabled: false,
  };

  beforeEach(() => {
    unitUnderTest = new ClientService(new SameDayIntervalMapper(new TimeMapper()));
    localStorage.clear();
  });

  it('should be created', () => {
    expect(unitUnderTest).toBeTruthy();
  });
  describe(`${methodName(ClientService, 'addClient')} + ${methodName(ClientService, 'getAllClients')} + ${methodName(ClientService, 'deleteClient')}`, () => {
    it('should return empty', () => {
      expect(unitUnderTest.getAllClients()).empty;
    });
    it('should add one client', () => {
      unitUnderTest.addClient(newTestClient1);
      const actual = unitUnderTest.getAllClients();
      expect(actual).toHaveLength(1);
      expect(actual[0]).toEqual({ ...newTestClient1, id: 1 });
    });
    it('should add two clients', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      const actual = unitUnderTest.getAllClients();
      expect(actual).toEqual([
        { ...newTestClient1, id: 1 },
        { ...newTestClient2, id: 2 },
      ]);
    });
    it('should delete one client', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      unitUnderTest.deleteClient({ ...newTestClient2, id: 2 });
      expect(unitUnderTest.getAllClients()).toEqual([{ ...newTestClient1, id: 1 }]);
    });
    it('should delete all clients', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      unitUnderTest.deleteClient({ ...newTestClient2, id: 2 });
      unitUnderTest.deleteClient({ ...newTestClient1, id: 1 });
      expect(unitUnderTest.getAllClients()).empty;
    });
    it('should keep adding ids when last one is deleted', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      unitUnderTest.deleteClient({ ...newTestClient2, id: 2 });
      unitUnderTest.addClient(newTestClient2);
      expect(unitUnderTest.getAllClients()).toEqual([
        { ...newTestClient1, id: 1 },
        { ...newTestClient2, id: 3 },
      ]);
    });
    it('should keep order when first one is deleted', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      unitUnderTest.deleteClient({ ...newTestClient1, id: 1 });
      unitUnderTest.addClient(newTestClient1);
      expect(unitUnderTest.getAllClients()).toEqual([
        { ...newTestClient2, id: 2 },
        { ...newTestClient1, id: 3 },
      ]);
    });
    it('should delete client even if temporarily edited', () => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.deleteClient({
        comment: 'new-comment',
        name: 'Kis Gizella Éva',
        schedule: [],
        sessionCountsInWeek: 4,
        id: 1,
        disabled: false,
      });
      expect(unitUnderTest.getAllClients()).empty;
    });
  });
  describe(`${methodName(ClientService, 'editClient')} + ${methodName(ClientService, 'editScheduleForClient')}`, () => {
    let testClient1: Client;
    let testClient2: Client;
    beforeEach(() => {
      unitUnderTest.addClient(newTestClient1);
      unitUnderTest.addClient(newTestClient2);
      [testClient1, testClient2] = unitUnderTest.getAllClients();
    });
    it("should edit second client's name", () => {
      const editedClient: Client = { ...testClient2, name: 'Nagyné Kis Amanda' };
      unitUnderTest.editClient(editedClient);
      expect(unitUnderTest.getAllClients()).toEqual([{ ...newTestClient1, id: 1 }, editedClient]);
    });
    it('should add schedule for first client', () => {
      const schedule: Array<SameDayInterval> = [makeSameDayInterval(1, [10, 15], [13, 30])];
      unitUnderTest.editScheduleForClient(testClient1, schedule);
      const readTestClient1 = unitUnderTest.getAllClients()[0];
      expect(readTestClient1).toEqual({ ...testClient1, schedule });
    });

    it('should sort schedules for second client', () => {
      const schedule1: SameDayInterval = makeSameDayInterval(1, [10, 15], [13, 30]);
      const schedule2: SameDayInterval = makeSameDayInterval(1, [18, 45], [20, 0]);
      const schedule3: SameDayInterval = makeSameDayInterval(3, [10, 15], [13, 30]);
      const schedule: Array<SameDayInterval> = [schedule2, schedule3, schedule1];
      unitUnderTest.editScheduleForClient(testClient2, schedule);
      const readTestClient2 = unitUnderTest.getAllClients()[1];
      expect(readTestClient2).toEqual({
        ...testClient2,
        schedule: [schedule1, schedule2, schedule3],
      });
    });
    it('should override the whole schedule for first client', () => {
      const schedule1: SameDayInterval = makeSameDayInterval(1, [10, 15], [13, 30]);
      const schedule2: SameDayInterval = makeSameDayInterval(1, [18, 45], [20, 0]);
      const schedule3: SameDayInterval = makeSameDayInterval(3, [10, 15], [13, 30]);
      const oldSchedule: Array<SameDayInterval> = [schedule3, schedule2];
      const newSchedule: Array<SameDayInterval> = [schedule2, schedule1];
      unitUnderTest.editScheduleForClient(testClient1, oldSchedule);
      unitUnderTest.editScheduleForClient(testClient1, newSchedule);
      const readTestClient1 = unitUnderTest.getAllClients()[0];
      expect(readTestClient1).toEqual({
        ...testClient1,
        schedule: [schedule1, schedule2],
      });
    });
  });
});
