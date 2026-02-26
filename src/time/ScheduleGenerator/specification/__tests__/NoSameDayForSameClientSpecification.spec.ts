import { Client } from '../../../../client/Client';
import { methodName } from '../../../../utils/test-name';
import { ClientInfo } from '../../Table';
import { NoSameDayForSameClientSpecification } from '../rules/NoSameDayForSameClientSpecification';
import { makeTable, selectForSpec } from './SpecificationTestHelper';

describe(methodName(NoSameDayForSameClientSpecification, 'check'), () => {
  const unitUnderTest = new NoSameDayForSameClientSpecification();

  const createClient = (id: number): Client => ({
    id,
    name: `Client ${id}`,
    sessionCountsInWeek: 1,
    comment: '',
    schedule: [],
    disabled: false,
  });

  const createClientInfos = (...ids: Array<number>): Array<ClientInfo> =>
    ids.map((anId) => ({
      client: createClient(anId),
      joinedAt: [],
    }));

  it('returns true when same client appears on different days', () => {
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
      ],
      createClientInfos(1),
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns true when multiple clients appear on same day but without duplication', () => {
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [] },
        { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3] },
      ],
      createClientInfos(1, 2, 3),
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);
  });

  it('returns false when the same client has multiple sessions on the same day', () => {
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [1] }, // duplicate same day
      ],
      createClientInfos(1),
    );

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('returns false when duplication occurs across different cells on the same day with multiple clients', () => {
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 2] },
        { timeInterval: { dayNumber: 1, start: [8, 45], end: [10, 0] }, clientIdsInvolved: [3, 2] }, // client 2 duplicated
      ],
      createClientInfos(1, 2, 3),
    );
    table.currentClientIndex = 1; // clientId: 2

    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });

  it('ignores duplication across days but detects it within each individual day', () => {
    const table = makeTable(
      [
        { timeInterval: { dayNumber: 1, start: [7, 0], end: [8, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 1, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [2] },
        { timeInterval: { dayNumber: 2, start: [7, 0], end: [8, 15] }, clientIdsInvolved: [1] },
        { timeInterval: { dayNumber: 2, start: [8, 15], end: [9, 30] }, clientIdsInvolved: [1] }, // duplicate day 2
      ],
      createClientInfos(1, 2),
    );
    table.currentScheduleItemIndex = 0;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleItemIndex = 1;
    table.currentClientIndex = 1;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(true);

    table.currentScheduleItemIndex = 2;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);

    table.currentScheduleItemIndex = 3;
    table.currentClientIndex = 0;
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });
  it('should handle case when client is registered twice', () => {
    const table = makeTable(
      [{ timeInterval: { dayNumber: 1, start: [7, 30], end: [8, 45] }, clientIdsInvolved: [1, 1] }],
      createClientInfos(1),
    );
    expect(unitUnderTest.check(...selectForSpec(table))).toBe(false);
  });
});
