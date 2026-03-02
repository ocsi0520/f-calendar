import { ClientInfoGenerator } from '../ClientInfoGenerator';
import { TimeIntervalManager } from '../../../../TimeInterval/TimeIntervalManager';
import { TimeManager } from '../../../../TimeManager';
import { ClientInfoValidator } from '../ClientInfoValidator';
import { ClientInfoSorter } from '../ClientInfoSorter';
import { ScheduleCell } from '../../../Table';
import { expect, describe, it } from 'vitest';
import { Client } from '../../../../../client/Client';

describe('ClientInfoGenerator', () => {
  const timeManager = new TimeManager();
  const timeIntervalManager = new TimeIntervalManager(timeManager);
  const validator = new ClientInfoValidator();
  const sorter = new ClientInfoSorter();
  const generator = new ClientInfoGenerator(timeIntervalManager, validator, sorter);

  it('generates possibleCellIndexes and uniqueDays correctly', () => {
    const cells: ScheduleCell[] = [
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [] },
    ];

    const client: Client = {
      id: 1,
      name: 'Test',
      sessionCountsInWeek: 1,
      comment: '',
      schedule: [{ dayNumber: 1, start: [7, 0], end: [12, 0] }],
      disabled: false,
    };

    const infos = generator.generateAllClientInfo(cells, [client]);
    expect(infos).toHaveLength(1);
    const info = infos[0];
    expect(info.client.id).toBe(1);
    // only the first two cells are within client's schedule (day 1)
    expect(info.possibleCellIndexes).toEqual([0, 1]);
    // uniqueDays should be 1 (only dayNumber 1)
    expect(info.uniqueDays).toBe(1);
  });

  it('sorts client infos by relative chance of success', () => {
    const cells: ScheduleCell[] = [
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [9, 30], end: [10, 45] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [] },
    ];

    const clientA: Client = {
      id: 1,
      name: 'A',
      sessionCountsInWeek: 1,
      comment: '',
      // available only on day 1 covering two cells -> possibleCellIndexes.length = 2, uniqueDays = 1 -> ratio 2
      schedule: [{ dayNumber: 1, start: [7, 0], end: [12, 0] }],
      disabled: false,
    };

    const clientB: Client = {
      id: 2,
      name: 'B',
      sessionCountsInWeek: 1,
      comment: '',
      // available on both days but only matches one cell -> possibleCellIndexes.length = 1, uniqueDays = 2 -> ratio 0.5
      schedule: [
        { dayNumber: 1, start: [8, 0], end: [8, 30] }, // matches first cell partly? keep narrow to include only first
        { dayNumber: 2, start: [10, 0], end: [11, 15] },
      ],
      disabled: false,
    };

    const infos = generator.generateAllClientInfo(cells, [clientA, clientB]);
    // sorter should place client with smaller relative chance first (clientB)
    expect(infos[0].client.id).toBe(2);
    expect(infos[1].client.id).toBe(1);
  });

  it('throws when a client has fewer uniqueDays than sessions required', () => {
    const cells: ScheduleCell[] = [
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [] },
    ];

    const client: Client = {
      id: 3,
      name: 'Failing',
      sessionCountsInWeek: 2, // requires 2 different days
      comment: '',
      schedule: [{ dayNumber: 1, start: [7, 0], end: [12, 0] }],
      disabled: false,
    };

    expect(() => generator.generateAllClientInfo(cells, [client])).toThrow();
  });
});
