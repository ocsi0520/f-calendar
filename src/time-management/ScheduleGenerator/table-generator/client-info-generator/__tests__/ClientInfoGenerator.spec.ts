import { Client } from '../../../../client/Client';
import { makeSameDayInterval } from '../../../../definition/TimeInterval';
import { SameDayIntervalManager } from '../../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../../managers/TimeManager';
import { SameDayIntervalMapper } from '../../../../mappers/SameDayIntervalMapper';
import { TimeMapper } from '../../../../mappers/TimeMapper';
import { TableCell } from '../../../Table';
import { ClientInfoGenerator } from '../ClientInfoGenerator';
import { ClientInfoSorter } from '../ClientInfoSorter';
import { ClientInfoValidator } from '../ClientInfoValidator';

// TODO: proper tests
describe('ClientInfoGenerator', () => {
  let unitUnderTest: ClientInfoGenerator;

  beforeEach(() => {
    const timeMapper = new TimeMapper();
    const timeManager = new TimeManager(timeMapper);
    const sameDayIntervalManager = new SameDayIntervalManager(
      timeManager,
      timeMapper,
      new SameDayIntervalMapper(timeMapper),
    );
    const validator = new ClientInfoValidator();
    const sorter = new ClientInfoSorter();
    unitUnderTest = new ClientInfoGenerator(sameDayIntervalManager, validator, sorter);
  });

  it('generates possibleCellIndexes and uniqueDays correctly', () => {
    const cells: TableCell[] = [
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [10, 0], [11, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(2, [9, 0], [10, 15]), clientIdsInvolved: [] },
    ];

    const client: Client = {
      id: 1,
      name: 'Test',
      sessionCountsInWeek: 1,
      comment: '',
      schedule: [makeSameDayInterval(1, [7, 0], [12, 0])],
      disabled: false,
    };

    const infos = unitUnderTest.generateAllClientInfo(cells, [client]);
    expect(infos).toHaveLength(1);
    const info = infos[0];
    expect(info.client.id).toBe(1);
    // only the first two cells are within client's schedule (day 1)
    expect(info.possibleCellIndexes).toEqual([0, 1]);
    // uniqueDays should be 1 (only dayNumber 1)
    expect(info.uniqueDays).toBe(1);
  });

  it('sorts client infos by relative chance of success', () => {
    const cells: TableCell[] = [
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(1, [9, 30], [10, 45]), clientIdsInvolved: [] },
      { timeInterval: makeSameDayInterval(2, [10, 0], [11, 15]), clientIdsInvolved: [] },
    ];

    const clientA: Client = {
      id: 1,
      name: 'A',
      sessionCountsInWeek: 1,
      comment: '',
      // available only on day 1 covering two cells -> possibleCellIndexes.length = 2, uniqueDays = 1 -> ratio 2
      schedule: [makeSameDayInterval(1, [7, 0], [12, 0])],
      disabled: false,
    };

    const clientB: Client = {
      id: 2,
      name: 'B',
      sessionCountsInWeek: 1,
      comment: '',
      // available on both days but only matches one cell -> possibleCellIndexes.length = 1, uniqueDays = 2 -> ratio 0.5
      schedule: [
        makeSameDayInterval(1, [8, 0], [8, 30]), // matches first cell partly? keep narrow to include only first
        makeSameDayInterval(2, [10, 0], [11, 15]),
      ],
      disabled: false,
    };

    const infos = unitUnderTest.generateAllClientInfo(cells, [clientA, clientB]);
    // sorter should place client with smaller relative chance first (clientB)
    expect(infos[0].client.id).toBe(2);
    expect(infos[1].client.id).toBe(1);
  });

  it('throws when a client has fewer uniqueDays than sessions required', () => {
    const cells: TableCell[] = [
      { timeInterval: makeSameDayInterval(1, [8, 0], [9, 15]), clientIdsInvolved: [] },
    ];

    const client: Client = {
      id: 3,
      name: 'Failing',
      sessionCountsInWeek: 2, // requires 2 different days
      comment: '',
      schedule: [makeSameDayInterval(1, [7, 0], [12, 0])],
      disabled: false,
    };

    expect(() => unitUnderTest.generateAllClientInfo(cells, [client])).toThrow();
  });
});
