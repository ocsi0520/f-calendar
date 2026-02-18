import { TestBed } from '@angular/core/testing';
import { TimeManager } from '../../../TimeManager';
import { TimeIntervalManager } from '../../../TimeInterval/TimeIntervalManager';
import { MorningChecker } from '../MorningChecker';
import { LunchSpecification } from '../LunchSpecification';
import { ScheduleItem, Table } from '../../Table';

// TODO: extensive test
// - there's morning session:
//    1. there's only one overlapping that ends at 14.00 - true
//    2. there's only one overlapping that ends at 14.15 - false
//    3. there's only one overlapping that starts at 14.30 - true
//    4. there's only one overlapping that starts at 14.15 - false
// - there's no morning session:
//    1. there's only one overlapping that ends at 13.30 - true
//    2. there's only one overlapping that ends at 13.45 - false
//    3. there's only one overlapping that starts at 14.00 - true
//    4. there's only one overlapping that starts at 13.45 - false
describe(LunchSpecification.name, () => {
  let timeIntervalManager: TimeIntervalManager;
  let morningChecker: MorningChecker;
  let unitUnderTest: LunchSpecification;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TimeIntervalManager, TimeManager] });
    timeIntervalManager = TestBed.inject(TimeIntervalManager);
    morningChecker = new MorningChecker(new TimeManager());
    unitUnderTest = new LunchSpecification(morningChecker, timeIntervalManager);
  });

  const makeTable = (items: ScheduleItem[]): Table => ({
    clientInfos: [],
    currentClientIndex: 0,
    scheduleItems: items,
  });

  it('returns true when less than 4 occupied sessions', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [9, 15], end: [10, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [11, 0], end: [12, 15] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when no sessions fall within lunch period', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [9, 0], end: [10, 15] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [10, 30], end: [11, 45] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [11, 45], end: [13, 0] }, clientIdsInvolved: [3] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns true when two sessions within lunch are separated by >= 60 minutes', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [12, 0], end: [13, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [14, 30], end: [15, 30] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(table)).toBe(true);
  });

  it('returns false when two sessions within lunch are separated by < 60 minutes', () => {
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [12, 45], end: [13, 30] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [13, 45], end: [14, 15] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [15, 0], end: [16, 0] }, clientIdsInvolved: [4] },
    ]);

    expect(unitUnderTest.check(table)).toBe(false);
  });

  it('respects morningChecker by choosing later lunch period for morning sessions', () => {
    // make the first session early morning so morningChecker.isMorningSession is true
    const table = makeTable([
      { timeInterval: { dayNumber: 1, start: [8, 0], end: [9, 0] }, clientIdsInvolved: [1] },
      { timeInterval: { dayNumber: 1, start: [13, 45], end: [14, 15] }, clientIdsInvolved: [2] },
      { timeInterval: { dayNumber: 1, start: [14, 45], end: [15, 15] }, clientIdsInvolved: [3] },
      { timeInterval: { dayNumber: 1, start: [16, 0], end: [17, 0] }, clientIdsInvolved: [4] },
    ]);

    // For morning sessions lunch period is 13:30-15:00; sessions at 13:45 and 14:45 overlap the adjusted window
    expect(unitUnderTest.check(table)).toBe(false);
  });
});
