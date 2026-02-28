import { TestBed } from '@angular/core/testing';
import { AvailableForMe } from '../rules/AvailableForMeSpecification';
import { MyTimeService } from '../../../../client/my-time.service';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { TimeIntervalMapper } from '../../../TimeInterval/TimeIntervalMapper';
import { TimeIntervalPrimitiveMapper } from '../../../TimeInterval/TimeIntervalPrimitiveMapper';
import { TimeIntervalEventMapper } from '../../../TimeInterval/TimeIntervalEventMapper';
import { Table } from '../../Table';
import { methodName } from '../../../../utils/test-name';
import { WeekSchedule } from '../../../Schedule';
import { makeTable, selectForSpec } from './SpecificationTestHelper';

describe(methodName(AvailableForMe, 'check'), () => {
  let myTimeService: MyTimeService;
  let timeIntervalManager: TimeIntervalManager;
  let unitUnderTest: AvailableForMe;

  beforeEach(() => {
    localStorage.clear();

    // Set up Angular injection context for services that use inject()
    TestBed.configureTestingModule({
      providers: [
        TimeIntervalManager,
        TimeIntervalPrimitiveMapper,
        TimeIntervalEventMapper,
        TimeIntervalMapper,
        MyTimeService,
      ],
    });

    // Get instances from the injector so inject() works properly
    timeIntervalManager = TestBed.inject(TimeIntervalManager);
    myTimeService = TestBed.inject(MyTimeService);
  });

  const createUnitUnderTestWithSchedule = (schedule: WeekSchedule) => {
    myTimeService.saveSchedule(schedule);
    return new AvailableForMe(myTimeService, timeIntervalManager);
  };

  const testSpec = (table: Table, expectedFalseAtIndexes: Array<number>): void => {
    for (let i = 0; i < table.scheduleCells.length; i++) {
      table.currentScheduleCellIndex = i;
      const expectedValue = expectedFalseAtIndexes.includes(i) ? false : true;
      expect(unitUnderTest.check(...selectForSpec(table))).toBe(expectedValue);
    }
  };

  it('returns true when all occupied cells fall within my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [7, 0], end: [12, 0] },
      { dayNumber: 2, start: [8, 0], end: [18, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 2, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);
    testSpec(table, []);
  });

  it('returns false when an occupied cell does not fall within my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [9, 0], end: [11, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] },
    ]);
    testSpec(table, [0]);
  });

  it('returns false when an occupied cell extends beyond my schedule end time', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [11, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [12, 0] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, [0]);
  });

  it('returns false when an occupied cell starts before my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [11, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [7, 45], end: [9, 0] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, [0]);
  });

  it('returns false when an occupied cell is on a day with no availability', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [17, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 2, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, [0]);
  });

  it('returns true when cell exactly matches schedule boundaries', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [9, 15] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, []);
  });

  it('returns true when cell is at the start boundary of my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [17, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [10, 0] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, []);
  });

  it('returns true when cell is at the end boundary of my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [17, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [15, 45], end: [17, 0] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, []);
  });

  it('returns true when multiple occupied cells all fall within my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [7, 0], end: [18, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [12, 0], end: [13, 15] }, clientIdsInvolved: [3] },
    ]);
    testSpec(table, []);
  });

  it('returns false when one of multiple occupied cells falls outside my schedule', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [12, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [2] },
    ]);

    testSpec(table, [1]);
  });

  it('returns true when cell falls within one of multiple schedule intervals on the same day', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [10, 0] },
      { dayNumber: 1, start: [12, 0], end: [18, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [13, 0], end: [14, 15] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, []);
  });

  it('returns false when cell starts in one interval but extends into a gap', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [10, 0] },
      { dayNumber: 1, start: [12, 0], end: [18, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] },
    ]);

    testSpec(table, [0]);
  });

  it('returns true with mixed occupied and unoccupied cells', () => {
    unitUnderTest = createUnitUnderTestWithSchedule([
      { dayNumber: 1, start: [8, 0], end: [17, 0] },
    ]);
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [] },
      { timeInterval: { dayNumber: 1, start: [10, 0], end: [11, 15] }, clientIdsInvolved: [2] },
    ]);

    testSpec(table, []);
  });
});
