import { AvailableForClientsSpecification } from '../rules/AvailableForClientsSpecification';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { ClientInfo } from '../../Table';
import { Client } from '../../../../client/Client';
import { methodName } from '../../../../utils/test-name';
import { WeekSchedule } from '../../../Schedule';
import { makeTable, selectForSpec } from './SpecificationTestHelper';
import { TimeManager } from '../../../TimeManager';

// TODO: revise test

describe(methodName(AvailableForClientsSpecification, 'check'), () => {
  let unitUnderTest: AvailableForClientsSpecification;

  beforeEach(() => {
    unitUnderTest = new AvailableForClientsSpecification(
      new TimeIntervalManager(new TimeManager()),
    );
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
    disabled: false,
  });

  const createClientInfo = (client: Client): ClientInfo => ({
    client,
    joinedAt: [],
  });

  it('returns true when there are no occupied schedule cells', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [] },
        { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
      ],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when all occupied cells fall within all clients schedules', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 2, start: [8, 0], end: [18, 0] }]);
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
      ],
      [createClientInfo(client1), createClientInfo(client2)],
    );
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when an occupied cell does not fall within a clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [9, 0], end: [11, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns false when an occupied cell extends beyond a clients schedule end time', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns false when an occupied cell is on a day with no client availability', () => {
    const client = createClient(1, [{ dayNumber: 2, start: [7, 0], end: [18, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns true when cell exactly matches schedule boundaries', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when cell is at the start boundary of clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when cell is at the end boundary of clients schedule', () => {
    const client = createClient(1, [{ dayNumber: 1, start: [8, 0], end: [10, 0] }]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when multiple occupied cells all fall within all clients schedules', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 1, start: [8, 0], end: [18, 0] }]);
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [2] },
      ],
      [createClientInfo(client1), createClientInfo(client2)],
    );
    table.currentScheduleCellIndex = 0;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 0;
    table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 1;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 2;
    table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when one client has an occupied cell outside their schedule', () => {
    const client1 = createClient(1, [{ dayNumber: 1, start: [7, 0], end: [12, 0] }]);
    const client2 = createClient(2, [{ dayNumber: 1, start: [8, 0], end: [11, 30] }]);
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [11, 30], end: [12, 45] }, clientIdsInvolved: [2] },
      ],
      [createClientInfo(client1), createClientInfo(client2)],
    );

    table.currentScheduleCellIndex = 0;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 0;
    table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 1;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleCellIndex = 2;
    table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns true when cell falls within one of multiple schedule intervals on the same day', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [9, 0] },
      { dayNumber: 1, start: [10, 0], end: [12, 0] },
    ]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when cell starts in one interval but extends into a gap', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [9, 0] },
      { dayNumber: 1, start: [10, 0], end: [12, 0] },
    ]);
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [8, 30], end: [10, 0] }, clientIdsInvolved: [1] }],
      [createClientInfo(client)],
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns true with mixed occupied and unoccupied cells', () => {
    const client = createClient(1, [
      { dayNumber: 1, start: [7, 0], end: [12, 0] },
      { dayNumber: 2, start: [8, 0], end: [18, 0] },
    ]);
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
        { timeInterval: { dayNumber: 2, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [1] },
      ],
      [createClientInfo(client)],
    );

    table.currentScheduleCellIndex = 0;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
    table.currentScheduleCellIndex = 2;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });
});
