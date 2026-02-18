import { AvailableForClientsSpecification } from '../AvailableForClientsSpecification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ScheduleItem, Table, ClientInfo } from '../../Table';
import { Client } from '../../../../client/Client';
import { methodName } from '../../../../utils/test-name';
import { WeekSchedule } from '../../../Schedule';
import { TestBed } from '@angular/core/testing';

// TODO: revise test

describe(methodName(AvailableForClientsSpecification, 'check'), () => {
  let timeIntervalManager: TimeIntervalManager;
  let unitUnderTest: AvailableForClientsSpecification;

  beforeEach(() => {
    timeIntervalManager = TestBed.inject(TimeIntervalManager);
    unitUnderTest = new AvailableForClientsSpecification(timeIntervalManager);
  });

  const createClient = (
    id: number,
    schedule: WeekSchedule,
    name: string = `Client ${id}`,
  ): Client => ({
    id,
    name,
    sessionCountsInWeek: 1,
    comment: '',
    schedule,
  });

  const createClientInfo = (client: Client): ClientInfo => ({
    client,
    joinedAt: [],
  });

  const makeTable = (clientInfos: ClientInfo[], scheduleItems: ScheduleItem[]): Table => ({
    clientInfos,
    currentClientIndex: 0,
    scheduleItems,
  });

  it('returns true when there are no occupied schedule items', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
      ],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when all occupied items fall within all clients schedules', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 2, start: [8, 0], end: [18, 0] }]);
    const table = makeTable(
      [createClientInfo(client1), createClientInfo(client2)],
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
      ],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when an occupied item does not fall within a clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [9, 0], end: [11, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns false when an occupied item extends beyond a clients schedule end time', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns false when an occupied item is on a day with no client availability', () => {
    const client = createClient(1, [{ dayNumber: 2, start: [7, 0], end: [18, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns true when item exactly matches schedule boundaries', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when item is at the start boundary of clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when item is at the end boundary of clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when multiple occupied items all fall within all clients schedules', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 1, start: [8, 0], end: [18, 0] }]);
    const table = makeTable(
      [createClientInfo(client1), createClientInfo(client2)],
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [2] },
      ],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when one client has an occupied item outside their schedule', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 1, start: [8, 0], end: [11, 30] }]);
    const table = makeTable(
      [createClientInfo(client1), createClientInfo(client2)],
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [2] },
      ],
    );

    expect(unitUnderTest.check(table)).toBe(false); // Last item extends beyond client2's availability
  });

  it('returns true when item falls within one of multiple schedule intervals on the same day', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [9, 0] },
      { dayNumber: 1, start: [10, 0], end: [12, 0] },
    ]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when item starts in one interval but extends into a gap', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [9, 0] },
      { dayNumber: 1, start: [10, 0], end: [12, 0] },
    ]);
    const table = makeTable(
      [createClientInfo(client)],
      [{ timeInterval: { dayNumber: 1, start: [8, 30], end: [10, 0] }, clientIdsInvolved: [1] }],
    );

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('returns true with mixed occupied and unoccupied items', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [12, 0] },
      { dayNumber: 2, start: [8, 0], end: [18, 0] },
    ]);
    const table = makeTable(
      [createClientInfo(client)],
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
        { timeInterval: { dayNumber: 2, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [1] },
      ],
    );

    expect(unitUnderTest.check(table)).toBe(true);
  });
});
